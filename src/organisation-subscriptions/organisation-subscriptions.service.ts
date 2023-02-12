import {Injectable, NotFoundException} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import CoreLoggerService from "../logger/CoreLoggerService";
import {Roles} from "../organisation/dto/RolesEnum";
import {Organisation} from "../organisation/entities/organisation.entity";
import {PaymentSessionService} from "../payment-sessions/payment-session.service";
import {OrganisationSubscriptionRecord} from "./entities/organisation-subscription.entity";
import {SaveOrganisationSubscriptionRecordDto} from "./models/fulfillSubscriptionDto";

@Injectable()
export class OrganisationSubscriptionService {
    constructor(
        private readonly logger: CoreLoggerService,
        @InjectRepository(Organisation)
        private orgRepo: Repository<Organisation>,
        @InjectRepository(OrganisationSubscriptionRecord)
        private orgSubRepository: Repository<OrganisationSubscriptionRecord>,
        private readonly paymentSessionService: PaymentSessionService
    ) {}
    private notFoundMessage =
        "Organisation not found or you are not owner of it";
    async findAllForOwnerOfOrg(
        orgUuid: string,
        currentUserId: number
    ): Promise<OrganisationSubscriptionRecord[]> {
        // find the org if the user is owner
        const org = await this.orgRepo.findOne({
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
        if (!org) {
            throw new NotFoundException(this.notFoundMessage);
        }

        return org.subscriptionRecords;
    }
    async findAllForOrg(
        orgUuid: string
    ): Promise<OrganisationSubscriptionRecord[]> {
        // find the org if the user is owner
        const org = await this.orgRepo.findOne({
            where: {
                uuid: orgUuid,
            },
            relations: {
                subscriptionRecords: true,
            },
        });
        if (!org) {
            throw new NotFoundException(this.notFoundMessage);
        }

        return org.subscriptionRecords;
    }

    async save(
        subRecordDtoCollection: SaveOrganisationSubscriptionRecordDto[]
    ): Promise<OrganisationSubscriptionRecord[]> {
        const results: OrganisationSubscriptionRecord[] = [];
        for (const subRecord of subRecordDtoCollection) {
            let sub = await this.orgSubRepository.findOne({
                where: {
                    paymentSystemTransactionId:
                        subRecord.paymentSystemTransactionId,
                },
            });

            if (!sub) {
                if (!subRecord.millerPaymentReferenceUuid) {
                    this.logger.error(
                        "Payment reference uuid not found. Cannot match this payment to a customer",
                        subRecord
                    );
                    throw new NotFoundException(
                        "Payment reference uuid not found. Cannot match this payment to a customer"
                    );
                }
                const paymentReference =
                    await this.paymentSessionService.findSessionByUuid(
                        subRecord.millerPaymentReferenceUuid
                    );
                const org = await this.orgRepo.findOne({
                    where: {
                        uuid: paymentReference?.organisationUuid,
                    },
                });

                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                sub = this.orgSubRepository.create({organisation: org!});
            }

            sub.paymentSystemMode = subRecord.paymentSystemMode;
            sub.paymentSystemCustomerId = subRecord.paymentSystemCustomerId;
            sub.paymentSystemName = subRecord.paymentSystemName;
            sub.paymentSystemProductId = subRecord.paymentSystemProductId;
            sub.paymentSystemTransactionId =
                subRecord.paymentSystemTransactionId;
            sub.validUntil = subRecord.validUntil;
            sub.productDisplayName = subRecord.productDisplayName;

            const result = await this.orgSubRepository.save(sub);
            results.push(result);
        }

        return results;
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
