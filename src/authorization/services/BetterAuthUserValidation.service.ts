import {
    BadRequestException,
    Injectable,
    Logger,
    NotFoundException,
} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {ILike, IsNull, MoreThan, Repository} from "typeorm";
import {Invitation} from "../../invitations/entities/invitation.entity.js";
import {OrganisationMembership} from "../../organisation-memberships/entities/organisation-membership.entity.js";
import {Roles} from "../../organisation/dto/RolesEnum.js";
import {MembershipRole} from "../../organisation/entities/member-role.entity.js";
import {Organisation} from "../../organisation/entities/organisation.entity.js";
import {User} from "../../user/entities/user.entity.js";
import {BetterAuthConfigurationService} from "../config/BetterAuthConfigurationService.js";
import type {AuthenticatedUserProfile} from "../models/AuthenticatedUserProfile.js";
import type {RequestUser} from "../models/RequestWithUser.js";

@Injectable()
export class BetterAuthUserValidationService {
    private readonly logger = new Logger(BetterAuthUserValidationService.name);

    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Invitation)
        private readonly invitationRepository: Repository<Invitation>,
        private readonly config: BetterAuthConfigurationService
    ) {}

    async validateUser(
        profile: AuthenticatedUserProfile,
        invitationId?: string
    ): Promise<RequestUser> {
        if (invitationId) {
            return this.addPermissionsToUser(
                await this.handleInvitedUser(profile, invitationId),
                profile.permissions
            );
        }

        let foundUser = await this.findUserByAuthProviderId(profile.id);
        if (!foundUser && profile.emailVerified) {
            foundUser = await this.findAndLinkExistingUser(profile);
        }
        if (foundUser?.memberships && foundUser.memberships.length > 0) {
            return this.addPermissionsToUser(foundUser, profile.permissions);
        }

        return this.addPermissionsToUser(
            await this.handleNewIndependentUser(foundUser, profile),
            profile.permissions
        );
    }

    async findUserByApiKey(apiKey: string): Promise<User | null> {
        return this.userRepository.findOne({
            where: {apiKeys: {apiKey}},
            relations: this.userRelations,
        });
    }

    private addPermissionsToUser(
        user: User,
        authProviderPermissions: string[] | undefined
    ): RequestUser {
        if (!user.id) {
            throw new Error("Unable to authenticate a valid application user");
        }

        const permissions = new Set(authProviderPermissions ?? []);
        if (
            user.authProviderUserId &&
            this.config.superUserIds.includes(user.authProviderUserId)
        ) {
            permissions.add("read:all");
            permissions.add("modify:all");
        }

        const activeSubscriptionProductKeys = new Set(
            user.memberships
                ?.flatMap(
                    (membership) =>
                        membership.organisation.subscriptionRecords ?? []
                )
                .filter((subscription) => subscription.validUntil > new Date())
                .map((subscription) => subscription.internalSku) ?? []
        );

        return {
            // RequestUser deliberately serializes the persisted user into a request principal.
            // eslint-disable-next-line @typescript-eslint/no-misused-spread
            ...user,
            permissions: [...permissions],
            activeSubscriptionProductKeys: [...activeSubscriptionProductKeys],
        };
    }

    private async findUserById(id: number): Promise<User | null> {
        return this.userRepository.findOne({
            where: {id},
            relations: this.userRelations,
        });
    }

    private async findUserByAuthProviderId(
        authProviderUserId: string
    ): Promise<User | null> {
        return this.userRepository.findOne({
            where: {authProviderUserId},
            relations: this.userRelations,
        });
    }

    private async findAndLinkExistingUser(
        profile: AuthenticatedUserProfile
    ): Promise<User | null> {
        const matches = await this.userRepository.find({
            where: {email: ILike(profile.email)},
            relations: this.userRelations,
            take: 2,
        });
        if (matches.length > 1) {
            this.logger.warn(
                `Cannot automatically link auth identity ${profile.id}: multiple application users share its verified email`
            );
            throw new BadRequestException(
                "This identity cannot be linked automatically. Contact support."
            );
        }

        if (matches.length === 0) {
            return null;
        }
        const user = matches[0];
        this.mapProfileToEntity(user, profile);
        await this.userRepository.save(user);
        this.logger.log(
            `Linked auth identity ${profile.id} to existing application user ${String(user.id)}`
        );
        return user;
    }

    private get userRelations() {
        return {
            memberships: {
                roles: true,
                user: false,
                organisation: {subscriptionRecords: true},
            },
        } as const;
    }

    private async handleInvitedUser(
        profile: AuthenticatedUserProfile,
        invitationCode: string
    ): Promise<User> {
        const now = new Date();
        const invitation = await this.invitationRepository.findOne({
            where: {
                uuid: invitationCode,
                acceptedOn: IsNull(),
                expiresOn: MoreThan(now),
            },
            relations: {
                organisationMembership: {
                    user: true,
                    organisation: true,
                },
            },
        });
        if (!invitation) {
            throw new NotFoundException(
                "Valid invitation not found with provided code"
            );
        }

        invitation.acceptedOn = new Date();
        const memberRole = invitation.organisationMembership.roles?.find(
            (role) => role.name === Roles.invited.toString()
        );
        if (!memberRole) {
            throw new Error("Invited role not found for member");
        }
        memberRole.name = Roles.member;
        this.mapProfileToEntity(
            invitation.organisationMembership.user,
            profile
        );

        try {
            await this.invitationRepository.save(invitation);
        } catch (error) {
            if (
                (error as {message?: string}).message?.includes("duplicate key")
            ) {
                throw new BadRequestException(
                    "User is already a member of this organisation"
                );
            }
            throw error;
        }

        const user = await this.findUserById(
            invitation.organisationMembership.user.id
        );
        if (!user) {
            throw new Error("User not found after accepting invitation");
        }
        return user;
    }

    private async handleNewIndependentUser(
        foundUser: User | null,
        profile: AuthenticatedUserProfile
    ): Promise<User> {
        this.logger.log(`Provisioning application user ${profile.id}`);

        const ownerRole = new MembershipRole();
        ownerRole.name = Roles.owner;

        const organisation = new Organisation();
        organisation.name = profile.givenName
            ? `${profile.givenName}'s Organisation`
            : "My Organisation";

        const membership = new OrganisationMembership();
        membership.organisation = organisation;
        membership.roles = [ownerRole];

        const user = foundUser ?? this.userRepository.create();
        user.memberships = [membership];
        this.mapProfileToEntity(user, profile);

        const savedUser = await this.userRepository.save(user);
        const loadedUser = await this.findUserById(savedUser.id);
        if (!loadedUser) {
            throw new Error("User not found after provisioning");
        }
        return loadedUser;
    }

    private mapProfileToEntity(
        user: User,
        profile: AuthenticatedUserProfile
    ): void {
        user.authProviderUserId = profile.id;
        user.blocked = false;
        user.email = profile.email;
        user.emailVerified = profile.emailVerified;
        user.familyName = profile.familyName;
        user.givenName = profile.givenName;
        user.name = profile.name;
        user.picture = profile.picture;
        user.username = profile.username;
    }
}
