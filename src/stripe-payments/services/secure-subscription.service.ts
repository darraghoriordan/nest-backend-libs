import {Injectable, Logger} from "@nestjs/common";
import {InjectQueue} from "@nestjs/bullmq";
import {Organisation} from "../../organisation/entities/organisation.entity.js";
import {OrganisationSubscriptionRecord} from "../../organisation-subscriptions/entities/organisation-subscription.entity.js";
import {Queue} from "bullmq";
import {InjectRepository} from "@nestjs/typeorm";
import {QueryFailedError, Repository} from "typeorm";
import {StripePaymentState} from "../entities/stripe-payment-state.entity.js";
import type {StripePaymentsEntitlementInput} from "../stripe-payments.extensions.js";

export type SecureSubscriptionInput = StripePaymentsEntitlementInput;

@Injectable()
export class SecureSubscriptionService {
    private readonly logger = new Logger(SecureSubscriptionService.name);

    constructor(
        @InjectRepository(OrganisationSubscriptionRecord)
        private readonly subscriptionRepository: Repository<OrganisationSubscriptionRecord>,
        @InjectQueue("subscription-activation-changed")
        private readonly activationQueue: Queue
    ) {}

    async findByUuid(uuid: string): Promise<OrganisationSubscriptionRecord> {
        const record = await this.subscriptionRepository.findOne({
            where: {uuid},
            relations: {organisation: true},
        });
        if (!record) {
            throw new Error("Subscription record not found");
        }
        return record;
    }

    async findByTransactionId(
        paymentSystemTransactionId: string
    ): Promise<OrganisationSubscriptionRecord | null> {
        return this.subscriptionRepository.findOne({
            where: {paymentSystemTransactionId},
            relations: {organisation: true},
        });
    }

    async findByCustomerId(
        paymentSystemCustomerId: string,
        mode?: string
    ): Promise<OrganisationSubscriptionRecord[]> {
        return this.subscriptionRepository.find({
            where: {
                paymentSystemCustomerId,
                ...(mode ? {paymentSystemMode: mode} : {}),
            },
            relations: {organisation: true},
        });
    }

    async save(
        input: SecureSubscriptionInput
    ): Promise<OrganisationSubscriptionRecord> {
        const {record, shouldActivate} = await this.saveRecord(input);

        if (shouldActivate) {
            await this.activationQueue.add(
                "activation-changed",
                {
                    organisationUuid: record.organisation.uuid,
                    subscriptionUuid: record.uuid,
                    productKey: record.internalSku,
                    active: record.validUntil > new Date(),
                },
                {
                    jobId: `subscription-activation:${record.uuid}:${String(record.validUntil.getTime())}`,
                    attempts: 5,
                    backoff: {type: "exponential", delay: 2_000},
                    removeOnComplete: {age: 86_400, count: 10_000},
                    removeOnFail: {age: 604_800, count: 10_000},
                }
            );
        }

        return record;
    }

    async revokeCustomerPayments(
        customerId: string,
        input: Pick<
            SecureSubscriptionInput,
            "stripeEventId" | "stripeEventCreatedAt" | "stripeStatus"
        >
    ): Promise<void> {
        const records = await this.findByCustomerId(customerId, "payment");
        for (const record of records) {
            await this.save({
                paymentSystemTransactionId: record.paymentSystemTransactionId,
                paymentSystemProductId: record.paymentSystemProductId,
                paymentSystemCustomerId: record.paymentSystemCustomerId,
                paymentSystemCustomerEmail: record.paymentSystemCustomerEmail,
                paymentSystemMode: "payment",
                paymentSystemName: "stripe",
                validUntil: new Date(),
                internalSku: record.internalSku,
                productDisplayName: record.productDisplayName,
                organisationUuid: record.organisation.uuid,
                stripeEventId: input.stripeEventId,
                stripeEventCreatedAt: input.stripeEventCreatedAt,
                stripeStatus: input.stripeStatus,
            });
        }
    }

    async revokePayment(
        paymentSystemTransactionId: string,
        input: Pick<
            SecureSubscriptionInput,
            "stripeEventId" | "stripeEventCreatedAt" | "stripeStatus"
        >
    ): Promise<boolean> {
        const record = await this.findByTransactionId(
            paymentSystemTransactionId
        );
        if (record?.paymentSystemMode !== "payment") {
            return false;
        }
        await this.save({
            paymentSystemTransactionId: record.paymentSystemTransactionId,
            paymentSystemProductId: record.paymentSystemProductId,
            paymentSystemCustomerId: record.paymentSystemCustomerId,
            paymentSystemCustomerEmail: record.paymentSystemCustomerEmail,
            paymentSystemMode: "payment",
            paymentSystemName: "stripe",
            validUntil: new Date(),
            internalSku: record.internalSku,
            productDisplayName: record.productDisplayName,
            organisationUuid: record.organisation.uuid,
            stripeEventId: input.stripeEventId,
            stripeEventCreatedAt: input.stripeEventCreatedAt,
            stripeStatus: input.stripeStatus,
        });
        return true;
    }

    private async saveRecord(input: SecureSubscriptionInput): Promise<{
        record: OrganisationSubscriptionRecord;
        shouldActivate: boolean;
    }> {
        try {
            return await this.subscriptionRepository.manager.transaction(
                async (manager) => {
                    await manager.query(
                        "SELECT pg_advisory_xact_lock(hashtext($1))",
                        [input.paymentSystemTransactionId]
                    );
                    const subscriptionRepository = manager.getRepository(
                        OrganisationSubscriptionRecord
                    );
                    const stateRepository =
                        manager.getRepository(StripePaymentState);
                    const state = await stateRepository.findOne({
                        where: {
                            paymentSystemTransactionId:
                                input.paymentSystemTransactionId,
                        },
                    });
                    let record = await subscriptionRepository.findOne({
                        where: {
                            paymentSystemTransactionId:
                                input.paymentSystemTransactionId,
                        },
                        relations: {organisation: true},
                    });
                    const isDuplicateEvent =
                        state?.lastStripeEventCreatedAt.getTime() ===
                            input.stripeEventCreatedAt.getTime() &&
                        state.lastStripeEventId === input.stripeEventId;
                    if (
                        record &&
                        state &&
                        (state.lastStripeEventCreatedAt >
                            input.stripeEventCreatedAt ||
                            isDuplicateEvent)
                    ) {
                        return {
                            record,
                            // Retry the durable activation notification if the
                            // previous attempt failed after the DB commit.
                            shouldActivate: isDuplicateEvent,
                        };
                    }

                    const isNewRecord = !record;
                    if (!record) {
                        const organisation = input.organisationUuid
                            ? await manager
                                  .getRepository(Organisation)
                                  .findOne({
                                      where: {uuid: input.organisationUuid},
                                  })
                            : null;
                        if (!organisation) {
                            throw new Error(
                                "Payment could not be matched to an organisation"
                            );
                        }
                        record = subscriptionRepository.create({
                            organisation,
                        });
                    }

                    const previousValidUntil = isNewRecord
                        ? undefined
                        : record.validUntil.getTime();
                    record.paymentSystemTransactionId =
                        input.paymentSystemTransactionId;
                    record.paymentSystemProductId =
                        input.paymentSystemProductId;
                    record.paymentSystemCustomerId =
                        input.paymentSystemCustomerId;
                    record.paymentSystemCustomerEmail =
                        input.paymentSystemCustomerEmail;
                    record.paymentSystemMode = input.paymentSystemMode;
                    record.paymentSystemName = input.paymentSystemName;
                    record.validUntil = input.validUntil;
                    record.internalSku = input.internalSku;
                    record.productDisplayName = input.productDisplayName;

                    const savedRecord =
                        await subscriptionRepository.save(record);
                    const shouldActivate =
                        isNewRecord ||
                        state?.lastStripeEventId !== input.stripeEventId ||
                        previousValidUntil !== input.validUntil.getTime();

                    const paymentState =
                        state ??
                        stateRepository.create({
                            paymentSystemTransactionId:
                                input.paymentSystemTransactionId,
                        });
                    paymentState.lastStripeEventId = input.stripeEventId;
                    paymentState.lastStripeEventCreatedAt =
                        input.stripeEventCreatedAt;
                    paymentState.status = input.stripeStatus;
                    await stateRepository.save(paymentState);

                    return {record: savedRecord, shouldActivate};
                }
            );
        } catch (error) {
            if (
                error instanceof QueryFailedError &&
                (error as QueryFailedError & {driverError: {code?: string}})
                    .driverError.code === "23505"
            ) {
                const existing = await this.findByTransactionId(
                    input.paymentSystemTransactionId
                );
                if (existing) {
                    this.logger.warn(
                        `Ignored concurrent duplicate payment ${input.paymentSystemTransactionId}`
                    );
                    return {record: existing, shouldActivate: false};
                }
            }
            throw error;
        }
    }
}
