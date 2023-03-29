import {Injectable, NotFoundException} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {nanoid} from "nanoid";
import {Repository} from "typeorm";
import {UserApiKey} from "./userApiKey.entity.js";

@Injectable()
export class UserApiKeyService {
    // private readonly logger = new Logger(UserApiKeyService.name);
    constructor(
        @InjectRepository(UserApiKey)
        private repository: Repository<UserApiKey>
    ) {}

    async getAllForUser(uuid: string): Promise<UserApiKey[]> {
        return this.repository.find({
            where: {
                user: {uuid},
            },
        });
    }
    async findOneByKey(apiKey: string): Promise<UserApiKey> {
        return this.repository.findOneOrFail({
            where: {apiKey},
            relations: {
                user: true,
            },
        });
    }
    /**
     * When working on keys with the api, use an id to find the key
     * @param id
     * @returns
     */
    async findOneById(id: number): Promise<UserApiKey> {
        return this.repository.findOneOrFail({
            where: {id},
            relations: {
                user: true,
            },
        });
    }

    async refreshKeyValue(
        uuid: string,
        currentUserUuid: string
    ): Promise<UserApiKey> {
        const userApiKey = await this.repository.findOneBy({
            uuid,
            user: {uuid: currentUserUuid},
        });
        if (!userApiKey) {
            throw new NotFoundException();
        }

        userApiKey.apiKey = "mKey_" + nanoid();

        return this.repository.save(userApiKey);
    }

    async createKey(
        currentUserId: number,
        description: string
    ): Promise<UserApiKey> {
        const userApiKey = new UserApiKey();
        userApiKey.description = description;
        userApiKey.userId = currentUserId;
        userApiKey.apiKey = "mKey_" + nanoid();

        return this.repository.save(userApiKey);
    }

    async remove(uuid: string, currentUserUuid: string): Promise<boolean> {
        const userApiKey = await this.repository.findOneBy({
            uuid,
            user: {uuid: currentUserUuid},
        });
        if (!userApiKey) {
            throw new NotFoundException();
        }
        // note, no soft delete here. Once a key is gone it should be gone
        await this.repository.remove(userApiKey);
        return true;
    }
}
