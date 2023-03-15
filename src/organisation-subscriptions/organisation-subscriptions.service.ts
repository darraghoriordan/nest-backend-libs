import {Injectable, Logger, NotFoundException} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {Roles} from "../organisation/dto/RolesEnum.js";
import {Organisation} from "../organisation/entities/organisation.entity.js";
import {PaymentSessionService} from "../payment-sessions/payment-session.service.js";
import {OrganisationSubscriptionRecord} from "./entities/organisation-subscription.entity.js";
import {SaveOrganisationSubscriptionRecordDto} from "./models/fulfillSubscriptionDto.js";

@Injectable()
export class OrganisationSubscriptionService {
    private readonly logger = new Logger(OrganisationSubscriptionService.name);
    constructor(
        @InjectRepository(Organisation)
        private orgRepo: Repository<Organisation>,
        @InjectRepository(OrganisationSubscriptionRecord)
        private orgSubRepository: Repository<OrganisationSubscriptionRecord>,
        private readonly paymentSessionService: PaymentSessionService
    ) {}
    private notFoundMessage =
        "Organisation not found or you are not owner of it";
    async findAllForOwnerOfOrg(
        orgId: number,
        currentUserId: number
    ): Promise<OrganisationSubscriptionRecord[]> {
        // find the org if the user is owner
        const org = await this.orgRepo.findOne({
            where: {
                id: orgId,
                memberships: {
                    userId: currentUserId,
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

        return org.subscriptionRecords ?? [];
    }

    async findOne(
        subscriptionUuid: string
    ): Promise<OrganisationSubscriptionRecord> {
        // find the org if the user is owner
        const record = await this.orgSubRepository.findOne({
            where: {
                uuid: subscriptionUuid,
            },
            relations: {
                organisation: true,
            },
        });

        if (!record) {
            throw new NotFoundException("Subscription not found");
        }

        return record;
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

        return org.subscriptionRecords ?? [];
    }

    async findAll(): Promise<OrganisationSubscriptionRecord[]> {
        return this.orgSubRepository.find();
    }

    // eslint-disable-next-line sonarjs/cognitive-complexity
    async save(
        subRecordDtoCollection: SaveOrganisationSubscriptionRecordDto[],
        orgId?: number
    ): Promise<OrganisationSubscriptionRecord[]> {
        const results: OrganisationSubscriptionRecord[] = [];
        for (const subRecord of subRecordDtoCollection) {
            let existingSubscription = await this.orgSubRepository.findOne({
                where: {
                    paymentSystemTransactionId:
                        subRecord.paymentSystemTransactionId,
                },
            });

            if (!existingSubscription) {
                // if no existing subscription then create a new one, get the org
                let org: Organisation | undefined;

                if (orgId === undefined) {
                    if (!subRecord.millerPaymentReferenceUuid) {
                        this.logger.error(
                            "No organisation uuid or payment reference uuid provided. Cannot match this payment to a customer",
                            subRecord
                        );
                        throw new NotFoundException(
                            "No organisation uuid or payment reference uuid provided.  Cannot match this payment to a customer"
                        );
                    }
                    const paymentReference =
                        await this.paymentSessionService.findSessionByUuid(
                            subRecord.millerPaymentReferenceUuid ?? ""
                        );

                    org =
                        (await this.orgRepo.findOne({
                            where: {
                                uuid: paymentReference?.organisationUuid,
                            },
                        })) || undefined;
                } else {
                    // eslint-disable-next-line prefer-const
                    org =
                        (await this.orgRepo.findOne({
                            where: {
                                id: orgId,
                            },
                        })) || undefined;
                }

                existingSubscription = this.orgSubRepository.create({
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    organisation: org!,
                });
                if (!org) {
                    this.logger.error(
                        "Failed to find organisation. Cannot match this payment to a customer",
                        subRecord
                    );
                    throw new NotFoundException(
                        "Failed to find organisation.  Cannot match this payment to a customer"
                    );
                }
            }

            existingSubscription.paymentSystemMode =
                subRecord.paymentSystemMode;
            existingSubscription.paymentSystemCustomerId =
                subRecord.paymentSystemCustomerId;
            existingSubscription.paymentSystemName =
                subRecord.paymentSystemName;
            existingSubscription.paymentSystemProductId =
                subRecord.paymentSystemProductId;
            existingSubscription.paymentSystemTransactionId =
                subRecord.paymentSystemTransactionId;
            existingSubscription.paymentSystemCustomerEmail =
                subRecord.paymentSystemCustomerEmail;
            existingSubscription.validUntil = subRecord.validUntil;
            existingSubscription.productDisplayName =
                subRecord.productDisplayName;

            const result = await this.orgSubRepository.save(
                existingSubscription
            );
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
