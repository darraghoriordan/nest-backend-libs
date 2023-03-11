/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {Injectable, NotFoundException} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {AuthZClientService} from "../authzclient/authz.service";
import {UserProfile} from "../authzclient/UserProfile.dto";
import {InvitationService} from "../invitations";
import {OrganisationMembership} from "../organisation-memberships/entities/organisation-membership.entity";
import {Roles} from "../organisation/dto/RolesEnum";
import {MembershipRole} from "../organisation/entities/member-role.entity";
import {Organisation} from "../organisation/entities/organisation.entity";
import {User} from "../user-internal";
import {AccessToken} from "./AccessToken";

@Injectable()
export class UserValidationService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        private authzClient: AuthZClientService,
        private invitationService: InvitationService
    ) {}

    async getAuth0User(
        rawAccessToken: string
    ): Promise<UserProfile | undefined> {
        return await this.authzClient.getUser(rawAccessToken);
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
            return this.handleInvitation(rawAccessToken, invitationId);
        }
        // try to find the user and their memberships
        const foundUser = await this.userRepository.findOne({
            where: {auth0UserId: payload.sub},
            relations: {
                memberships: true,
            },
        });

        // if user is
        // - found
        // - already configured
        // - not trying to join an organisation
        // then just return the user
        if (
            foundUser !== undefined &&
            foundUser !== null &&
            foundUser.memberships.length > 0
        ) {
            return foundUser;
        }
        // otherwise we need to add a membership to a user
        return this.handleNewIndependentUser(foundUser, rawAccessToken);
    }

    async handleInvitation(
        rawAccessToken: string,
        invitationCode: string
    ): Promise<User> {
        const invitation = await this.invitationService.getOneActiveInvitation(
            invitationCode
        );
        if (!invitation) {
            throw new NotFoundException("Valid invitation not found");
        }

        // get the user's profile details from auth0
        const auth0User = await this.getAuth0User(rawAccessToken);
        if (auth0User === undefined) {
            throw new Error("Error getting user profile from Auth0");
        }

        if (auth0User.email_verified === false) {
            throw new Error("Email not verified");
        }

        // the user's verified email address should match the invitation email address
        if (
            auth0User.email.toLowerCase() !==
            invitation.emailAddress.toLowerCase()
        ) {
            throw new Error(
                "Verified email address does not match invitation email address"
            );
        }

        await this.invitationService.acceptInvitation(invitation.id);

        // eslint-disable-next-line sonarjs/prefer-immediate-return
        const savedUser = await this.updateUserFromAuth0(
            invitation.organisationMembership.user,
            auth0User
        );
        return savedUser;
    }

    async handleNewIndependentUser(
        foundUser: User | null,
        rawAccessToken: string
    ) {
        // get the user's profile details from auth0
        const auth0User = await this.getAuth0User(rawAccessToken);
        if (auth0User === undefined) {
            throw new Error("Error getting user profile from Auth0");
        }

        if (auth0User.email_verified === false) {
            throw new Error("Email not verified");
        }

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
        // eslint-disable-next-line sonarjs/prefer-immediate-return
        const updatedUser = this.updateUserFromAuth0(user, auth0User);
        return updatedUser;
    }

    async updateUserFromAuth0(user: User, auth0User: UserProfile) {
        user.auth0UserId = auth0User.sub;
        user.blocked = false;
        user.email = auth0User.email;
        user.emailVerified = auth0User.email_verified;
        user.familyName = auth0User.family_name;
        user.givenName = auth0User.given_name;
        user.name = auth0User.name;
        user.picture = auth0User.picture;
        user.username = auth0User.preferred_username;

        // save user
        return this.userRepository.save(user);
    }
}
