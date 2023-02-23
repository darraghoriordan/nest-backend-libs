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
import {Person} from "../person/entities/person.entity";
import {AccessToken} from "./AccessToken";

@Injectable()
export class UserValidationService {
    constructor(
        @InjectRepository(Person)
        private repository: Repository<Person>,
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
    ): Promise<Person | undefined> {
        // try to find the person and their memberships
        const foundPerson = await this.repository.findOne({
            where: {auth0UserId: payload.sub},
            relations: {
                memberships: true,
            },
        });

        // if person already configured then get out of here
        if (
            foundPerson !== undefined &&
            foundPerson !== null &&
            foundPerson.memberships.length > 0
        ) {
            return foundPerson;
        }

        // if no person is found locally then get the user's profile details from auth0
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

        if (foundPerson !== undefined && foundPerson !== null) {
            // if person already exists then add the membership to the existing person
            foundPerson.memberships = [membership];
            return this.repository.save(foundPerson);
        }

        const person = this.repository.create();
        person.memberships = [membership];
        // eslint-disable-next-line sonarjs/prefer-immediate-return
        const updatedPerson = this.updatePersonFromAuth0(person, auth0User);
        return updatedPerson;
    }

    async updatePersonFromAuth0(person: Person, auth0User: UserProfile) {
        person.auth0UserId = auth0User.sub;
        person.blocked = false;
        person.email = auth0User.email;
        person.emailVerified = auth0User.email_verified;
        person.familyName = auth0User.family_name;
        person.givenName = auth0User.given_name;
        person.name = auth0User.name;
        person.picture = auth0User.picture;
        person.username = auth0User.preferred_username;

        // save person
        return this.repository.save(person);
    }
}
