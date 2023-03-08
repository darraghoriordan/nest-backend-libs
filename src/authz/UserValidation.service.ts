/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {AuthZClientService} from "../authzclient/authz.service";
import {UserProfile} from "../authzclient/UserProfile.dto";
import {OrganisationMembership} from "../organisation-memberships/entities/organisation-membership.entity";
import {Roles} from "../organisation/dto/RolesEnum";
import {MembershipRole} from "../organisation/entities/member-role.entity";
import {Organisation} from "../organisation/entities/organisation.entity";
import {User} from "../user-internal";
//import {User} from "../user/entities/user.entity";
import {AccessToken} from "./AccessToken";

@Injectable()
export class UserValidationService {
    constructor(
        @InjectRepository(User)
        private repository: Repository<User>,
        private authzClient: AuthZClientService
    ) {}

    async getAuth0User(
        payload: AccessToken,
        rawAccessToken: string
    ): Promise<UserProfile | undefined> {
        return await this.authzClient.getUser(rawAccessToken);
    }

    async validateUser(
        payload: AccessToken,
        rawAccessToken: string
    ): Promise<User | undefined> {
        // try to find the user and their memberships
        const foundUser = await this.repository.findOne({
            where: {auth0UserId: payload.sub},
            relations: {
                memberships: true,
            },
        });

        // if user already configured then get out of here
        if (
            foundUser !== undefined &&
            foundUser !== null &&
            foundUser.memberships.length > 0
        ) {
            return foundUser;
        }

        // if no user is found locally then get the user's profile details from auth0
        const auth0User = await this.getAuth0User(payload, rawAccessToken);
        if (auth0User === undefined) {
            return;
        }

        // create a new organisation
        const unsavedOrganisation = new Organisation();
        unsavedOrganisation.name = auth0User.given_name
            ? `${auth0User.given_name}'s Organisation`
            : `My Organisation`;

        // create roles
        const ownerRole = new MembershipRole();
        ownerRole.name = Roles.owner;

        // create a new membership
        const membership = new OrganisationMembership();
        membership.organisation = unsavedOrganisation;
        membership.roles = [ownerRole];

        if (foundUser !== undefined && foundUser !== null) {
            // if user already exists then add the membership to the existing user
            foundUser.memberships = [membership];
            return this.repository.save(foundUser);
        }

        const user = this.repository.create();
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
        return this.repository.save(user);
    }
}
