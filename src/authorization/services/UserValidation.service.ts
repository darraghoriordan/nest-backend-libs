/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
    BadRequestException,
    Injectable,
    Logger,
    NotFoundException,
} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {IsNull, MoreThan, Repository} from "typeorm";
import {AuthZClientService} from "../../authzclient/authz.service.js";
import {UserProfile} from "../../authzclient/UserProfile.dto.js";
import {Invitation} from "../../invitations/entities/invitation.entity.js";
import {OrganisationMembership} from "../../organisation-memberships/entities/organisation-membership.entity.js";
import {Roles} from "../../organisation/dto/RolesEnum.js";
import {MembershipRole} from "../../organisation/entities/member-role.entity.js";
import {Organisation} from "../../organisation/entities/organisation.entity.js";
import {User} from "../../user-internal/entities/user.entity.js";
import {AccessToken} from "../models/AccessToken.js";

@Injectable()
export class UserValidationService {
    private readonly logger = new Logger(UserValidationService.name);
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        private authzClient: AuthZClientService,
        @InjectRepository(Invitation)
        private readonly invitationRepository: Repository<Invitation>
    ) {}

    async getAuth0User(rawAccessToken: string): Promise<UserProfile> {
        const result = await this.authzClient.getUser(rawAccessToken);

        if (result === undefined) {
            throw new Error("Error getting user profile from Auth0");
        }

        if (result.email_verified === false) {
            throw new BadRequestException(
                "Email not verified. You must verify your email address to continue."
            );
        }

        return result;
    }

    async validateUserApiKey(apiKey: string): Promise<User | undefined> {
        const result = await this.userRepository.findOne({
            where: {apiKeys: {apiKey: apiKey}},
            relations: {
                memberships: true,
            },
        });
        // convert from null
        if (!result) return undefined;

        return result;
    }
    async validateUser(
        payload: AccessToken,
        rawAccessToken: string,
        invitationId?: string
    ): Promise<User | undefined> {
        if (invitationId) {
            // even though there is commonality here it's easier to treat the invitation path as completely separate
            return this.handleInvitedUser(rawAccessToken, invitationId);
        }

        // try to find the user and their memberships
        const foundUser = await this.findUserForRequest(payload.sub);

        // if user is
        // - found
        // - already configured
        // then just return the user
        if (
            foundUser !== undefined &&
            foundUser !== null &&
            foundUser?.memberships !== undefined &&
            foundUser?.memberships !== null &&
            foundUser?.memberships?.length > 0
        ) {
            return foundUser;
        }
        // otherwise we need to add a membership to a user
        return this.handleNewIndependentUser(foundUser, rawAccessToken);
    }

    private async findUserForRequest(auth0UserId: string) {
        return await this.userRepository.findOne({
            where: {auth0UserId: auth0UserId},
            relations: {
                memberships: true,
            },
        });
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    async handleInvitedUser(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        rawAccessToken: string,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
            (r) => r.name === Roles.invited
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

        const userForRequest = await this.userRepository.findOne({
            where: {id: invitation.organisationMembership.user.id},
            relations: {
                memberships: true,
            },
        });
        if (!userForRequest) {
            throw new Error("User not found");
        }
        return userForRequest;
    }

    async handleNewIndependentUser(
        foundUser: User | null,
        rawAccessToken: string
    ) {
        // get the user's profile details from auth0
        const auth0User = await this.getAuth0User(rawAccessToken);

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

        this.mapAuthZUserToEntity(user, auth0User);

        const savedUser = await this.userRepository.save(user);
        const userForRequest = await this.userRepository.findOne({
            where: {id: savedUser.id},
            relations: {
                memberships: true,
            },
        });
        if (!userForRequest) {
            throw new Error("User not found");
        }
        return userForRequest;
    }

    mapAuthZUserToEntity(user: User, auth0User: UserProfile) {
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
