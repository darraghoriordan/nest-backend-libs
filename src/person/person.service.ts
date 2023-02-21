import {Injectable, Logger, NotFoundException} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {RequestPerson} from "../authz/RequestWithUser";
import {Roles} from "../organisation/dto/RolesEnum";
import {UpdatePersonDto} from "./dto/update-person.dto";
import {Person} from "./entities/person.entity";

@Injectable()
export class PersonService {
    private readonly logger = new Logger(PersonService.name);
    constructor(
        @InjectRepository(Person)
        private repository: Repository<Person>
    ) {}

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

    async findAllPeopleInSystem(): Promise<Person[]> {
        return await this.repository.find();
    }

    async findOne(id: number) {
        return this.repository.findOneOrFail({
            where: {id},
            relations: {
                memberships: {
                    roles: true,
                },
            },
        });
    }

    async findOneByUuid(uuid: string): Promise<Person> {
        return this.repository.findOneOrFail({
            relations: {
                memberships: {
                    roles: true,
                },
            },
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
