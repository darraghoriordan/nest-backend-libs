import {Injectable, NotFoundException} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {DeleteResult, Repository} from "typeorm";
import {Roles} from "../organisation/dto/RolesEnum";
import {MembershipRole} from "../organisation/entities/member-role.entity";
import {Organisation} from "../organisation/entities/organisation.entity";
import {CreateUpdateMembershipDto} from "./dtos/create-membership-dto";
import {OrganisationMembership} from "./entities/organisation-membership.entity";

@Injectable()
export class OrganisationMembershipsService {
    constructor(
        @InjectRepository(Organisation)
        private orgRepo: Repository<Organisation>,
        @InjectRepository(OrganisationMembership)
        private membershipRepo: Repository<OrganisationMembership>
    ) {}
    private notFoundMessage =
        "Organisation not found or you are not owner of it";
    async findAllForOrgUser(
        orgUuid: string,
        currentUserId: number
    ): Promise<OrganisationMembership[]> {
        // no paging here ... yet!
        const memberships = await this.membershipRepo.find({
            where: {
                organisation: {
                    uuid: orgUuid,
                },
            },
            relations: {
                roles: true,
            },
        });

        // is the person a member of the organisation?
        const isAMember = memberships.some(
            (m) => m.person.id === currentUserId
        );

        if (!isAMember) {
            throw new Error("You are not a member of this organisation");
        }
        console.log("memberships", memberships);
        return memberships;
    }
    async createOrUpdate(
        orgUuid: string,
        createOmDto: CreateUpdateMembershipDto,
        currentUserId: number
    ): Promise<Organisation> {
        // find the org
        const org = await this.orgRepo.findOne({
            where: {
                uuid: orgUuid,
            },
            relations: {
                memberships: {
                    roles: true,
                },
            },
        });
        if (!org) {
            throw new NotFoundException(this.notFoundMessage);
        }
        // check if the user is allowed to work with memberships
        this.currentUserIsOwnerGuard(org, currentUserId);

        // existing membership for this person?
        const existingMembership = org.memberships.find(
            (m) => m.person.id === createOmDto.personId
        );
        if (existingMembership) {
            // add all roles to the existing membership
            for (const role of createOmDto.roles) {
                const existingRole = existingMembership.roles.find(
                    (r) => r.name === role
                );
                if (!existingRole) {
                    const newRole = new MembershipRole();
                    newRole.name = role;
                    existingMembership.roles.push(newRole);
                }
            }
            // remove all roles that are not in the DTO
            existingMembership.roles = existingMembership.roles.filter((r) =>
                createOmDto.roles.includes(r.name)
            );
        } else {
            // create a new membership
            const newMembership = new OrganisationMembership();
            newMembership.personId = createOmDto.personId;
            for (const role of createOmDto.roles) {
                const newRole = new MembershipRole();
                newRole.name = role;
                newMembership.roles.push(newRole);
            }
            org.memberships.push(newMembership);
        }

        return await this.orgRepo.save(org);
    }

    private currentUserIsOwnerGuard(org: Organisation, currentUserId: number) {
        const membership = org.memberships.find(
            (m) =>
                m.person.id === currentUserId &&
                m.roles.some((r) => r.name === Roles.owner)
        );
        if (!membership) {
            throw new NotFoundException(
                "You are not allowed to add a member to this organisation"
            );
        }
    }

    async remove(
        orgUuid: string,
        membershipUuid: string,
        currentUserId: number
    ): Promise<DeleteResult> {
        // find the org
        const org = await this.orgRepo.findOne({
            where: {
                uuid: orgUuid,
            },
            relations: {
                memberships: {
                    roles: true,
                },
            },
        });
        if (!org) {
            throw new NotFoundException(this.notFoundMessage);
        }
        // check if the user is allowed to work with memberships
        this.currentUserIsOwnerGuard(org, currentUserId);

        // remove the membership
        const membership = org.memberships.find(
            (m) => m.uuid === membershipUuid
        );
        if (!membership) {
            throw new Error("Membership not found");
        }
        return await this.membershipRepo.delete(membership.id);
    }
}
