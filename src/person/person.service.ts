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
        // fake the user for our m2m token user used in testing
        // m2m users don't get profiles
        if (payload.sub === "qgxmSYCc92PRWDcg9ia19C681ua7iaED@clients") {
            const integrationTestM2MFakeUser = new UserProfile();
            integrationTestM2MFakeUser.email_verified = true;
            integrationTestM2MFakeUser.family_name = "O Riordan";
            integrationTestM2MFakeUser.gender = undefined;
            integrationTestM2MFakeUser.sub = payload.sub;
            integrationTestM2MFakeUser.given_name = "Darragh";
            integrationTestM2MFakeUser.name = "darragh.oriordan@gmail.com";
            integrationTestM2MFakeUser.email = "darragh.oriordan@gmail.com";
            integrationTestM2MFakeUser.picture =
                "https://s.gravatar.com/avatar/cabb1573ace049b462d82c1f3205ddbb?s=480&r=pg&d=https%3A%2F%2Fcdn.auth0.com%2Favatars%2Fda.png";
            return integrationTestM2MFakeUser;
        }

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
        try {
            return await this.repository.findOneOrFail({
                auth0UserId: auth0Id,
            });
        } catch (error) {
            this.logger.error("Couldn't find a user to notify", error);
            return undefined;
        }
    }

    async findOne(id: number) {
        return this.repository.findOneOrFail(id);
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
        try {
            const user = await this.repository.findOneOrFail({
                uuid,
            });

            return this.repository.remove(user);
        } catch (error) {
            this.logger.error("Couldn't find a user to notify", error);
            throw new NotFoundException();
        }
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
