import {Injectable, NotFoundException} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {AccessToken} from "../authz/AccessToken";
import {RequestPerson} from "../authz/RequestWithUser";
import {AuthZClientService} from "../authzclient/authz.service";
import {UserProfile} from "../authzclient/UserProfile.dto";
import CoreLoggerService from "../logger/CoreLoggerService";
import {OrganisationMembership} from "../organisation-memberships/entities/organisation-membership.entity";
import {Roles} from "../organisation/dto/RolesEnum";
import {MembershipRole} from "../organisation/entities/member-role.entity";
import {Organisation} from "../organisation/entities/organisation.entity";
import {UpdatePersonDto} from "./dto/update-person.dto";
import {Person} from "./entities/person.entity";

@Injectable()
export class PersonService {
    constructor(
        @InjectRepository(Person)
        private repository: Repository<Person>,
        private logger: CoreLoggerService,
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
            relations: ["memberships"],
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
        return this.updatePersonFromAuth0(person, auth0User);
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

    async findAll() {
        return this.repository.find();
    }

    async findOneByAuth0Id(auth0Id: string): Promise<Person | undefined> {
        return this.repository.findOneOrFail({
            where: {
                auth0UserId: auth0Id,
            },
        });
    }

    async findOneIfSameOrganisation(
        uuid: string,
        currentUser: RequestPerson
    ): Promise<Person> {
        const person = await this.repository.findOneOrFail({
            where: {
                uuid,
            },
            relations: {
                memberships: {
                    roles: true,
                },
            },
        });
        if (
            person.memberships.some((m) =>
                currentUser.memberships.some(
                    (cu) => cu.organisationId === m.organisationId
                )
            )
        ) {
            return person;
        }
        throw new NotFoundException();
    }
    async findOne(id: number) {
        return this.repository.findOneOrFail({where: {id}});
    }

    async findOneByUuid(uuid: string): Promise<Person> {
        return this.repository.findOneOrFail({
            relations: ["memberships"],
            where: {uuid},
        });
    }

    async update(
        uuid: string,
        updatePersonDto: UpdatePersonDto,
        currentUserUuid: string
    ) {
        this.isOwnerGuard(uuid, currentUserUuid, "update");
        return this.repository.update({uuid}, updatePersonDto);
    }

    async remove(uuid: string, currentUserUuid: string): Promise<Person> {
        this.isOwnerGuard(uuid, currentUserUuid, "delete");

        const user = await this.repository.findOneOrFail({
            where: {
                uuid,
            },
            relations: {
                memberships: {
                    roles: true,
                },
            },
        });
        if (
            user.memberships.some((m) =>
                m.roles.some((r) => r.name === Roles.owner)
            )
        ) {
            throw new Error(
                "Can't remove the owner of an organisation. Assign a new owner first."
            );
        }

        return this.repository.remove(user);
    }

    private isOwnerGuard(
        uuid: string,
        currentUserUuid: string,
        attemptedAction: string
    ) {
        if (uuid !== currentUserUuid) {
            this.logger.warn(`Attempted to ${attemptedAction} another user`, {
                currentUserUuid,
                uuid,
            });
            throw new NotFoundException();
        }
    }
}
