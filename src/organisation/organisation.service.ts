import {Injectable, NotFoundException} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {DeleteResult, Repository, UpdateResult} from "typeorm";
import {OrganisationMembership} from "../organisation-memberships/entities/organisation-membership.entity.js";
import {CreateOrganisationDto} from "./dto/create-organisation.dto.js";
import {Roles} from "./dto/RolesEnum.js";
import {UpdateOrganisationDto} from "./dto/update-organisation.dto.js";
import {MembershipRole} from "./entities/member-role.entity.js";
import {Organisation} from "./entities/organisation.entity.js";

@Injectable()
export class OrganisationService {
    constructor(
        @InjectRepository(Organisation)
        private repository: Repository<Organisation>
    ) {}
    private notFoundMessage =
        "Organisation not found or you are not owner of it";
    async create(
        createOrganisationDto: CreateOrganisationDto
    ): Promise<Organisation> {
        // create a new organisation
        const unsavedOrganisation = new Organisation();
        unsavedOrganisation.name = createOrganisationDto.name;
        unsavedOrganisation.memberships = [];

        // add the owner
        const ownerMembership = new OrganisationMembership();
        ownerMembership.user = createOrganisationDto.owner;
        const ownerRole = new MembershipRole();
        ownerRole.name = Roles.owner;
        ownerMembership.roles.push(ownerRole);

        unsavedOrganisation.memberships.push(ownerMembership);

        // add all the others
        const normalMemberships = createOrganisationDto.members.map(
            (member) => {
                const membership = new OrganisationMembership();
                membership.user = member;
                const memberRole = new MembershipRole();
                memberRole.name = Roles.member;
                membership.roles.push(memberRole);
                return membership;
            }
        );
        unsavedOrganisation.memberships.push(...normalMemberships);

        return this.repository.save(unsavedOrganisation);
    }

    async findAllForUser(currentUserId: number): Promise<Organisation[]> {
        return this.repository.find({
            where: {
                memberships: {
                    user: {
                        id: currentUserId,
                    },
                },
            },
        });
    }

    async findOne(uuid: string, currentUserId: number): Promise<Organisation> {
        const org = await this.repository.findOne({
            where: {
                uuid,
                memberships: {
                    user: {
                        id: currentUserId,
                    },
                },
            },
        });

        if (!org) {
            throw new NotFoundException(this.notFoundMessage);
        }

        return org;
    }

    async update(
        uuid: string,
        updateOrganisationDto: UpdateOrganisationDto,
        currentUserId: number
    ): Promise<UpdateResult> {
        const ownerOfOrg = await this.repository.findOneOrFail({
            where: {
                uuid,
                memberships: {
                    user: {
                        id: currentUserId,
                    },
                    roles: {
                        name: Roles.owner,
                    },
                },
            },
        });
        this.repository.merge(ownerOfOrg, updateOrganisationDto);

        return this.repository.update(ownerOfOrg.id, ownerOfOrg);
    }

    async remove(uuid: string, currentUserId: number): Promise<DeleteResult> {
        const ownerOfOrg = await this.repository.findOneOrFail({
            where: {
                uuid,
                memberships: {
                    user: {
                        id: currentUserId,
                    },
                    roles: {
                        name: Roles.owner,
                    },
                },
            },
        });

        return this.repository.delete({
            id: ownerOfOrg.id,
        });
    }
}
