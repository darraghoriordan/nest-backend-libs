import {Injectable, Logger} from "@nestjs/common";
import {Job} from "bullmq";
import {OnWorkerEvent, Processor, WorkerHost} from "@nestjs/bullmq";
import Stripe from "stripe";
import {StripePaymentEventService} from "./stripe-payment-event.service.js";
import {StripePaymentFulfillmentService} from "./stripe-payment-fulfillment.service.js";

@Injectable()
@Processor("stripe-events")
export class StripePaymentEventProcessor extends WorkerHost {
    private readonly logger = new Logger(StripePaymentEventProcessor.name);

    constructor(
        private readonly eventService: StripePaymentEventService,
        private readonly fulfillmentService: StripePaymentFulfillmentService
    ) {
        super();
    }

    async process(job: Job<Stripe.Event>): Promise<void> {
        const event = job.data;
        const isClaimed = await this.eventService.claim(event.id);
        if (!isClaimed) {
            if (await this.eventService.isProcessed(event.id)) {
                return;
            }
            throw new Error(
                `Stripe event ${event.id} is currently claimed by another worker`
            );
        }

        try {
            await this.fulfillmentService.process(event);
            await this.eventService.markProcessed(event.id);
        } catch (error) {
            await this.eventService.markFailed(event.id, error);
            throw error;
        }
    }

    @OnWorkerEvent("failed")
    onFailed(job: Job<Stripe.Event> | undefined, error: Error): void {
        this.logger.error("Stripe payment queue job failed", {
            jobId: job?.id,
            eventId: job?.data.id,
            error: error.message,
        });
    }
}
