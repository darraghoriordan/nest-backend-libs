import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {Roles} from "../organisation/dto/RolesEnum";
import {Organisation} from "../organisation/entities/organisation.entity";
import {OrganisationSubscriptionRecord} from "./entities/organisation-subscription.entity";

@Injectable()
export class OrganisationSubscriptionService {
    constructor(
        @InjectRepository(Organisation)
        private orgRepo: Repository<Organisation>,
        @InjectRepository(OrganisationSubscriptionRecord)
        private orgSubRepository: Repository<OrganisationSubscriptionRecord>
    ) {}

    async findAllForOwnerOfOrg(
        orgUuid: string,
        currentUserId: number
    ): Promise<OrganisationSubscriptionRecord[]> {
        // find the org if the user is owner
        const org = await this.orgRepo.findOneOrFail({
            where: {
                uuid: orgUuid,
                memberships: {
                    personId: currentUserId,
                    roles: {
                        name: Roles.owner,
                    },
                },
            },
            relations: {
                subscriptionRecords: true,
            },
        });

        return org.subscriptionRecords;
    }

    async create(
        orgSub: OrganisationSubscriptionRecord,
        currentUserId: number
    ): Promise<OrganisationSubscriptionRecord> {
        // find the org

        await this.orgRepo.findOneOrFail({
            where: {
                id: orgSub.organisationId,
                memberships: {
                    personId: currentUserId,
                    roles: {
                        name: Roles.owner,
                    },
                },
            },
            relations: {
                subscriptionRecords: true,
            },
        });

        return await this.orgSubRepository.save(orgSub);
    }
}
