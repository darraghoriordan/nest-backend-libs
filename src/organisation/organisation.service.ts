import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {CreateOrganisationDto} from "./dto/create-organisation.dto";
import {UpdateOrganisationDto} from "./dto/update-organisation.dto";
import {Organisation} from "./entities/organisation.entity";

@Injectable()
export class OrganisationService {
    constructor(
        @InjectRepository(Organisation)
        private repository: Repository<Organisation>
    ) {}

    async create(createOrganisationDto: CreateOrganisationDto) {
        return this.repository.save(createOrganisationDto);
    }

    async findAll() {
        return this.repository.find();
    }

    async findOne(id: number) {
        return this.repository.findOneOrFail(id);
    }

    async update(id: number, updateOrganisationDto: UpdateOrganisationDto) {
        return this.repository.update(id, updateOrganisationDto);
    }

    async remove(id: number) {
        return this.repository.delete(id);
    }
}
