import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {DeleteResult, Repository, UpdateResult} from "typeorm";
import {CreateOrganisationDto} from "./dto/create-organisation.dto";
import {UpdateOrganisationDto} from "./dto/update-organisation.dto";
import {Organisation} from "./entities/organisation.entity";

@Injectable()
export class OrganisationService {
    constructor(
        @InjectRepository(Organisation)
        private repository: Repository<Organisation>
    ) {}

    async create(
        createOrganisationDto: CreateOrganisationDto
    ): Promise<Organisation> {
        return this.repository.save(createOrganisationDto);
    }

    async findAllForUser(currentUserId: number): Promise<Organisation[]> {
        return this.repository
            .createQueryBuilder("orgs")
            .innerJoinAndSelect("orgs.owner", "owner")
            .where("owner.id = :currentUserId")
            .setParameters({currentUserId})
            .getMany();
    }

    async findOne(uuid: string, currentUserId: number): Promise<Organisation> {
        return this.repository
            .createQueryBuilder("orgs")
            .innerJoinAndSelect("orgs.owner", "owner")
            .where("owner.id = :currentUserId")
            .andWhere("orgs.uuid = :uuid")
            .setParameters({currentUserId, uuid})
            .getOneOrFail();
    }

    async update(
        uuid: string,
        updateOrganisationDto: UpdateOrganisationDto,
        currentUserId: number
    ): Promise<UpdateResult> {
        return this.repository.update(
            {uuid, ownerId: currentUserId},
            updateOrganisationDto
        );
    }

    async remove(uuid: string, currentUserId: number): Promise<DeleteResult> {
        return this.repository.delete({
            uuid,
            ownerId: currentUserId,
        });
    }
}
