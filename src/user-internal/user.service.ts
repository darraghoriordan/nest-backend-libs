import {Injectable, NotFoundException} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {RequestUser} from "../authorization/models/RequestWithUser.js";
import {Roles} from "../organisation/dto/RolesEnum.js";
import {UpdateUserDto} from "./dto/update-user.dto.js";
import {User} from "./entities/user.entity.js";

@Injectable()
export class UserService {
    //private readonly logger = new Logger(UserService.name);
    constructor(
        @InjectRepository(User)
        private repository: Repository<User>
    ) {}

    async findAll() {
        return this.repository.find();
    }

    async findOneByAuth0Id(auth0Id: string): Promise<User | undefined> {
        return this.repository.findOneOrFail({
            where: {
                auth0UserId: auth0Id,
            },
        });
    }

    async findOneIfSameOrganisation(
        uuid: string,
        currentUser: RequestUser
    ): Promise<User> {
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
            user.memberships?.some((m) =>
                currentUser.memberships?.some(
                    (cu) => cu.organisationId === m.organisationId
                )
            )
        ) {
            return user;
        }
        throw new NotFoundException();
    }

    async findAllPeopleInSystem(): Promise<User[]> {
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

    async findOneByUuid(uuid: string): Promise<User> {
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
        updateUserDto: UpdateUserDto,
        currentUserUuid: string
    ) {
        this.isOwnerGuard(uuid, currentUserUuid, "update");

        return this.repository.update({uuid}, updateUserDto);
    }

    async remove(uuid: string, currentUserUuid: string): Promise<User> {
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
            user.memberships?.some((m) =>
                m.roles?.some((r) => r.name === Roles.owner)
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
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        attemptedAction: string
    ) {
        if (uuid !== currentUserUuid) {
            // this.logger.warn(`Attempted to ${attemptedAction} another user`, {
            //     currentUserUuid,
            //     uuid,
            // });
            throw new NotFoundException();
        }
    }
}
