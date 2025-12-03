import {
    BadRequestException,
    Injectable,
    Logger,
    NotFoundException,
} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {IsNull, MoreThan, Repository} from "typeorm";
import {AuthZClientService} from "../../authzclient/authz.service.js";
import {Invitation} from "../../invitations/entities/invitation.entity.js";
import {OrganisationMembership} from "../../organisation-memberships/entities/organisation-membership.entity.js";
import {Roles} from "../../organisation/dto/RolesEnum.js";
import {MembershipRole} from "../../organisation/entities/member-role.entity.js";
import {Organisation} from "../../organisation/entities/organisation.entity.js";
import {User} from "../../user/entities/user.entity.js";
import {AuthConfigurationService} from "../config/AuthConfigurationService.js";
import {AccessToken} from "../models/AccessToken.js";
import {RequestUser} from "../models/RequestWithUser.js";
import {UserInfoResponse} from "auth0";

@Injectable()
export class UserValidationService {
    private readonly logger = new Logger(UserValidationService.name);
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        private authzClient: AuthZClientService,
        @InjectRepository(Invitation)
        private readonly invitationRepository: Repository<Invitation>,
        private readonly config: AuthConfigurationService
    ) {}

    async getAuth0User(rawAccessToken: string): Promise<UserInfoResponse> {
        const result = await this.authzClient.getUser(rawAccessToken);

        if (result === undefined) {
            throw new Error("Error getting user profile from Auth0");
        }

        // removing this for now because it's not suitable when asking
        // for payment right away. Might work better for fremium?
        // if (result.email_verified === false) {
        //     throw new BadRequestException(
        //         "Email not verified. You must verify your email address to use this service."
        //     );
        // }

        return result;
    }

    addPermissionsToUser(
        user: User,
        authProviderPermissions: string[] | undefined
    ): RequestUser {
        this.logger.debug(
            {
                list: this.config.superUserIds,
                userId: user.uuid,
                userMail: user.email,
            },
            "super user ids"
        );
        if (!user?.id) {
            throw new Error(
                "Unable to authenticate and register a valid user with this auth0 user"
            );
        }
        const permissionsSet = new Set<string>(authProviderPermissions || []);

        if (
            user.auth0UserId &&
            this.config.superUserIds.includes(user.auth0UserId)
        ) {
            this.logger.log(
                "Super user detected, adding additional permissions: " +
                    user.auth0UserId
            );
            permissionsSet.add("read:all");
            permissionsSet.add("modify:all");
        }
        const activePaidForProducts = new Set<string>(
            user.memberships
                ?.flatMap((m) => m.organisation.subscriptionRecords || [])
                ?.filter((s) => s && s.validUntil > new Date())
                ?.map((s) => s?.internalSku) || []
        );

        // eslint-disable-next-line sonarjs/prefer-immediate-return
        return {
            ...user,
            permissions: [...permissionsSet],
            activeSubscriptionProductKeys: [...activePaidForProducts],
        } as RequestUser;
    }

    async validateUser(
        payload: AccessToken,
        rawAccessToken: string,
        invitationId?: string
    ): Promise<RequestUser> {
        if (invitationId) {
            this.logger.log(
                "Invitation id provider, will take the invitation path"
            );
            // even though there is commonality here it's easier to treat the invitation path as completely separate
            return this.addPermissionsToUser(
                await this.handleInvitedUser(rawAccessToken, invitationId),
                payload.permissions
            );
        }

        // try to find the user and their memberships
        const foundUser = await this.findUserByAuth0Id(payload.sub);

        // if user is
        // - found
        // - already configured
        // then just return the user
        if (
            foundUser?.memberships !== undefined &&
            foundUser?.memberships !== null &&
            foundUser?.memberships?.length > 0
        ) {
            return this.addPermissionsToUser(foundUser, payload.permissions);
        }

        // otherwise we need to add a membership to a user
        const userResult = await this.handleNewIndependentUser(
            foundUser,
            rawAccessToken
        );
        return this.addPermissionsToUser(userResult, payload.permissions);
    }

    async findUserByApiKey(apiKey: string): Promise<User | null> {
        return this.userRepository.findOne({
            where: {apiKeys: {apiKey: apiKey}},
            relations: {
                memberships: {
                    roles: true,
                    user: false,
                    organisation: {subscriptionRecords: true},
                },
            },
        });
    }

    private async findUserById(id: number): Promise<User | null> {
        return this.userRepository.findOne({
            where: {id},
            relations: {
                memberships: {
                    roles: true,
                    user: false,
                    organisation: {subscriptionRecords: true},
                },
            },
        });
    }
    private async findUserByAuth0Id(auth0UserId: string) {
        return await this.userRepository.findOne({
            where: {auth0UserId: auth0UserId},
            relations: {
                memberships: {
                    roles: true,
                    user: false,
                    organisation: {subscriptionRecords: true},
                },
            },
        });
    }

    async handleInvitedUser(
        rawAccessToken: string,

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
            this.logger.log(
                {
                    invitationCode,
                    now,
                },
                "invitation not found"
            );
            throw new NotFoundException(
                "Valid invitation not found with provided code"
            );
        }

        // get the user's profile details from auth0
        const auth0User = await this.getAuth0User(rawAccessToken);

        // set the invitation to accepted
        invitation.acceptedOn = new Date();
        // set the user's membership to member
        const memberRole = invitation.organisationMembership.roles?.find(
            (r) => r.name === Roles.invited.toString()
        );
        if (!memberRole) {
            throw new Error("Invited role not found for member");
        }
        memberRole.name = Roles.member;

        this.mapAuthZUserToEntity(
            invitation.organisationMembership.user,
            auth0User
        );

        try {
            this.logger.log("Saving updated invitation and the user");
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

        const userForRequest = await this.findUserById(
            invitation.organisationMembership.user.id
        );
        if (!userForRequest) {
            throw new Error("User not found");
        }
        this.logger.log("Returning the found user");
        return userForRequest;
    }

    async handleNewIndependentUser(
        foundUser: User | null,
        rawAccessToken: string
    ) {
        // get the user's profile details from auth0
        const auth0User = await this.getAuth0User(rawAccessToken);
        this.logger.log(
            `Found user ${auth0User.name} with email ${auth0User.email} on auth0`
        );
        // create role
        const newRole = new MembershipRole();
        newRole.name = Roles.owner;

        // create a brand new organisation
        const unsavedOrganisation = new Organisation();
        unsavedOrganisation.name = auth0User.given_name
            ? `${auth0User.given_name}'s Organisation`
            : `My Organisation`;

        // create a new membership
        const membership = new OrganisationMembership();
        membership.organisation = unsavedOrganisation;
        membership.roles = [newRole];

        // use the found user or create a new one
        const user = foundUser || this.userRepository.create();

        // assign the membership
        user.memberships = [membership];
        this.logger.log(
            `Mapping newly created user ${auth0User.name} with email ${auth0User.email} to the user entity`
        );
        this.mapAuthZUserToEntity(user, auth0User);

        const savedUser = await this.userRepository.save(user);
        const userForRequest = await this.findUserById(savedUser.id);
        if (!userForRequest) {
            throw new Error("User not found");
        }
        this.logger.log(`Saved and returning user ${userForRequest.name} `);
        return userForRequest;
    }

    mapAuthZUserToEntity(user: User, auth0User: UserInfoResponse) {
        user.auth0UserId = auth0User.sub;
        user.blocked = false;
        user.email = auth0User.email;
        user.emailVerified = auth0User.email_verified;
        user.familyName = auth0User.family_name;
        user.givenName = auth0User.given_name;
        user.name = auth0User.name;
        user.picture = auth0User.picture;
        user.username = auth0User.preferred_username;
    }
}
