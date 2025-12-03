import {
    ConflictException,
    Injectable,
    Logger,
    NotFoundException,
} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {RequestUser} from "../authorization/models/RequestWithUser.js";
import {Roles} from "../organisation/dto/RolesEnum.js";
import {UpdateUserDto} from "./dto/update-user.dto.js";
import {User} from "./entities/user.entity.js";

@Injectable()
export class UserService {
    private readonly logger = new Logger(UserService.name);
    constructor(
        @InjectRepository(User)
        private repository: Repository<User>
    ) {}

    async findAll(): Promise<User[]> {
        const allUsers = await this.repository.find({
            relations: {
                memberships: {
                    roles: true,
                    user: false,
                    organisation: {subscriptionRecords: true},
                },
            },
        });
        this.logger.debug({allUsers}, "Found all users");
        return allUsers;
    }

    async findOneByAuth0Id(auth0Id: string): Promise<User | undefined> {
        return this.repository.findOneOrFail({
            where: {
                auth0UserId: auth0Id,
            },
            relations: {
                memberships: {
                    roles: true,
                    user: false,
                    organisation: {subscriptionRecords: true},
                },
            },
        });
    }
    // can change this to querybuilder to reduce the
    // loops later
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
                    user: false,
                    organisation: {subscriptionRecords: true},
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

    async findOne(id: number) {
        return this.repository.findOneOrFail({
            where: {id},
            relations: {
                memberships: {
                    user: false,
                    roles: true,
                    organisation: {subscriptionRecords: true},
                },
            },
        });
    }

    async findOneByUuid(uuid: string): Promise<User> {
        return this.repository.findOneOrFail({
            relations: {
                memberships: {
                    roles: true,
                    user: false,
                    organisation: {subscriptionRecords: true},
                },
            },
            where: {uuid},
        });
    }

    async update(
        uuid: string,
        updateUserDto: UpdateUserDto,
        currentUser: RequestUser
    ) {
        if (!currentUser.permissions.includes("modify:all")) {
            this.isCurrentUserGuard(uuid, currentUser.uuid, "update");
        }

        return this.repository.update({uuid}, updateUserDto);
    }

    async remove(uuid: string, currentUser: RequestUser): Promise<User> {
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

        if (!currentUser.permissions.includes("modify:all")) {
            this.isCurrentUserGuard(uuid, currentUser.uuid, "update");
            if (
                user.memberships?.some((m) =>
                    m.roles?.some((r) => r.name === Roles.owner.toString())
                )
            ) {
                throw new ConflictException(
                    "Can't remove the owner of an organisation. Assign a new owner first."
                );
            }
        }

        return this.repository.softRemove(user);
    }

    private isCurrentUserGuard(
        uuid: string,
        currentUserUuid: string,

        attemptedAction: string
    ) {
        if (uuid !== currentUserUuid) {
            this.logger.warn(
                {uuid, currentUserUuid, attemptedAction},
                "User attempted to modify a user record for another user"
            );
            throw new NotFoundException();
        }
    }
}
