import {Injectable, NotFoundException} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {AccessToken} from "../authz/AccessToken";
import {AuthZClientService} from "../authzclient/authz.service";
import {UserProfile} from "../authzclient/UserProfile.dto";
import CoreLoggerService from "../logger/CoreLoggerService";
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
        // try to get org with person as a member
        const foundPerson = await this.repository.findOne({
            where: {auth0UserId: payload.sub},
        });
        // if result get out of here
        if (foundPerson !== undefined && foundPerson !== null) {
            return foundPerson;
        }
        // if not a result get the auth0 response
        const auth0User = await this.getAuth0User(payload, rawAccessToken);
        if (auth0User === undefined) {
            return;
        }
        // create a new org
        const unsavedOrganisation = new Organisation();
        unsavedOrganisation.name = "My Organisation";
        // create a new person.
        const person = this.repository.create();
        person.auth0UserId = auth0User.sub;
        person.blocked = false;
        person.email = auth0User.email;
        person.emailVerified = auth0User.email_verified;
        person.familyName = auth0User.family_name;
        person.givenName = auth0User.given_name;
        person.memberOfOrganisations = [unsavedOrganisation];
        person.ownerOfOrganisations = [unsavedOrganisation];
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

    async findOne(id: number) {
        return this.repository.findOneOrFail({where: {id}});
    }

    async findOneByUuid(uuid: string): Promise<Person> {
        return this.repository.findOneOrFail({
            relations: ["ownerOfOrganisations"],
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
        });
        if (user.ownerOfOrganisations.length > 0) {
            throw new Error("Can't remove the owner of an organisation");
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
