import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {Roles} from "../organisation/dto/RolesEnum";
import {Organisation} from "../organisation/entities/organisation.entity";
import {OrganisationSubscriptionRecord} from "./entities/organisation-subscription.entity";
import {SaveOrganisationSubscriptionRecordDto} from "./models/saveSubscriptionDto";

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
        subRecord: SaveOrganisationSubscriptionRecordDto
    ): Promise<OrganisationSubscriptionRecord> {
        // find the org
        const org = await this.orgRepo.findOneOrFail({
            where: {
                uuid: subRecord.organisationUuid,
            },
        });

        const sub = this.orgSubRepository.create();
        sub.organisationId = org.id;
        sub.stripeCustomerId = subRecord.stripeCustomerId;
        sub.stripePriceId = subRecord.stripePriceId;
        sub.stripeSubscriptionId = subRecord.stripeSubscriptionId;
        sub.validUntil = subRecord.validUntil;

        return this.orgSubRepository.save(sub);
    }

    async update(
        subUuid: string,
        subRecord: SaveOrganisationSubscriptionRecordDto
    ): Promise<OrganisationSubscriptionRecord> {
        const org = await this.orgRepo.findOneOrFail({
            where: {
                uuid: subRecord.organisationUuid,
            },
        });

        const sub = await this.orgSubRepository.findOneOrFail({
            where: {
                uuid: subUuid,
            },
        });

        sub.organisationId = org.id;
        sub.stripeCustomerId = subRecord.stripeCustomerId;
        sub.stripePriceId = subRecord.stripePriceId;
        sub.stripeSubscriptionId = subRecord.stripeSubscriptionId;
        sub.validUntil = subRecord.validUntil;

        return this.orgSubRepository.save(sub);
    }

    async delete(subUuid: string): Promise<boolean> {
        const result = await this.orgSubRepository.delete({
            uuid: subUuid,
        });

        return (
            result.affected !== undefined &&
            result.affected !== null &&
            result.affected > 0
        );
    }
}
