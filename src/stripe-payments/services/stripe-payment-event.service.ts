import {Injectable, Logger} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {Queue} from "bullmq";
import {InjectQueue} from "@nestjs/bullmq";
import {Repository} from "typeorm";
import Stripe from "stripe";
import {StripeCheckoutEvent} from "../entities/stripe-payment-event.entity.js";

interface RawStripeObject {
    id?: unknown;
    client_reference_id?: unknown;
}

function getObject(event: Stripe.Event): RawStripeObject {
    return event.data.object as unknown as RawStripeObject;
}

function getObjectId(event: Stripe.Event): string {
    const objectId = getObject(event).id;
    return typeof objectId === "string" ? objectId : "unknown";
}

function getClientReferenceId(event: Stripe.Event): string | undefined {
    const clientReferenceId = getObject(event).client_reference_id;
    return typeof clientReferenceId === "string"
        ? clientReferenceId
        : undefined;
}

@Injectable()
export class StripePaymentEventService {
    private readonly logger = new Logger(StripePaymentEventService.name);

    constructor(
        @InjectRepository(StripeCheckoutEvent)
        private readonly eventRepository: Repository<StripeCheckoutEvent>,
        @InjectQueue("stripe-events")
        private readonly eventQueue: Queue
    ) {}

    async receive(event: Stripe.Event): Promise<void> {
        let paymentEvent = await this.eventRepository.findOne({
            where: {stripeEventId: event.id},
        });
        if (!paymentEvent) {
            paymentEvent = this.eventRepository.create({
                stripeEventId: event.id,
                stripeObjectId: getObjectId(event),
                eventType: event.type,
                clientReferenceId: getClientReferenceId(event),
                stripeData: event,
                status: "received",
                processingAttempts: 0,
            });
            try {
                paymentEvent = await this.eventRepository.save(paymentEvent);
            } catch (error) {
                const code = (error as {driverError?: {code?: string}})
                    .driverError?.code;
                if (code !== "23505") {
                    throw error;
                }
                paymentEvent = await this.eventRepository.findOneOrFail({
                    where: {stripeEventId: event.id},
                });
            }
        }

        if (paymentEvent.status === "processed") {
            return;
        }

        const existingJob = await this.eventQueue.getJob(
            this.getBaseJobId(event.id)
        );
        if (existingJob && !(await existingJob.isFailed())) {
            return;
        }

        const jobId = existingJob
            ? `${this.getBaseJobId(event.id)}:retry:${String(Date.now())}`
            : this.getBaseJobId(event.id);
        await this.eventQueue.add("stripe-event", event, {
            jobId,
            attempts: 8,
            backoff: {type: "exponential", delay: 5_000},
            removeOnComplete: {age: 86_400, count: 10_000},
            removeOnFail: {age: 604_800, count: 10_000},
        });
    }

    async claim(eventId: string): Promise<boolean> {
        const now = new Date();
        const staleProcessingCutoff = new Date(now.getTime() - 5 * 60 * 1000);
        const result = await this.eventRepository
            .createQueryBuilder()
            .update(StripeCheckoutEvent)
            .set({
                status: "processing",
                processingStartedAt: now,
                processingAttempts: () => '"processingAttempts" + 1',
            })
            .where('"stripeEventId" = :eventId', {eventId})
            .andWhere(
                '("status" IN (:...retryableStatuses) OR ("status" = :processingStatus AND "processingStartedAt" < :staleProcessingCutoff))',
                {
                    retryableStatuses: ["received", "failed"],
                    processingStatus: "processing",
                    staleProcessingCutoff,
                }
            )
            .execute();
        return (result.affected ?? 0) > 0;
    }

    async isProcessed(eventId: string): Promise<boolean> {
        const paymentEvent = await this.eventRepository.findOne({
            select: {status: true},
            where: {stripeEventId: eventId},
        });
        return paymentEvent?.status === "processed";
    }

    async markProcessed(eventId: string): Promise<void> {
        await this.eventRepository.update(
            {stripeEventId: eventId},
            {
                status: "processed",
                processedAt: new Date(),
                errorMessage: undefined,
            }
        );
    }

    async markFailed(eventId: string, error: unknown): Promise<void> {
        const errorMessage =
            error instanceof Error ? error.message : String(error);
        await this.eventRepository.update(
            {stripeEventId: eventId},
            {
                status: "failed",
                errorMessage: errorMessage.slice(0, 2_000),
            }
        );
        this.logger.error("Stripe payment event processing failed", {
            eventId,
            error: errorMessage,
        });
    }

    async list(take: number, skip: number): Promise<StripeCheckoutEvent[]> {
        return this.eventRepository.find({
            take,
            skip,
            order: {createdDate: "DESC"},
        });
    }

    async replay(eventId: string): Promise<void> {
        const paymentEvent = await this.eventRepository.findOne({
            where: {stripeEventId: eventId},
        });
        if (!paymentEvent) {
            throw new Error("Stripe event not found");
        }
        paymentEvent.status = "received";
        paymentEvent.errorMessage = undefined;
        await this.eventRepository.save(paymentEvent);
        await this.eventQueue.add("stripe-event", paymentEvent.stripeData, {
            jobId: `${this.getBaseJobId(eventId)}:manual:${String(Date.now())}`,
            attempts: 8,
            backoff: {type: "exponential", delay: 5_000},
            removeOnComplete: {age: 86_400, count: 10_000},
            removeOnFail: {age: 604_800, count: 10_000},
        });
    }

    private getBaseJobId(eventId: string): string {
        return `stripe-event:${eventId}`;
    }
}
