import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {DeleteResult, Repository, UpdateResult} from "typeorm";
import {CreateOrganisationDto} from "./dto/create-organisation.dto";
import {Roles} from "./dto/RolesEnum";
import {UpdateOrganisationDto} from "./dto/update-organisation.dto";
import {MembershipRole} from "./entities/member-role.entity";
import {OrganisationMembership} from "./entities/organisation-membership.entity";
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
        // create a new organisation
        const unsavedOrganisation = new Organisation();
        unsavedOrganisation.name = createOrganisationDto.name;
        unsavedOrganisation.memberships = [];

        // add the owner
        const ownerMembership = new OrganisationMembership();
        ownerMembership.person = createOrganisationDto.owner;
        const ownerRole = new MembershipRole();
        ownerRole.name = Roles.owner;
        ownerMembership.roles.push(ownerRole);

        unsavedOrganisation.memberships.push(ownerMembership);

        // add all the others
        const normalMemberships = createOrganisationDto.members.map(
            (member) => {
                const membership = new OrganisationMembership();
                membership.person = member;
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
                    person: {
                        id: currentUserId,
                    },
                },
            },
        });
    }

    async findOne(uuid: string, currentUserId: number): Promise<Organisation> {
        return this.repository.findOneOrFail({
            where: {
                uuid,
                memberships: {
                    person: {
                        id: currentUserId,
                    },
                },
            },
        });
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
                    person: {
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
                    person: {
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
