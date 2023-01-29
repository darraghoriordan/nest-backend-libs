import {InjectQueue} from "@nestjs/bull";
import {
    BadRequestException,
    Inject,
    Injectable,
    RawBodyRequest,
} from "@nestjs/common";
import {Queue} from "bull";
import {Request} from "express";
import Stripe from "stripe";
import CoreLoggerService from "../../logger/CoreLoggerService";
import {StripeClientConfigurationService} from "../StripeClientConfigurationService";

@Injectable()
export class StripeWebhookHandler {
    constructor(
        private readonly config: StripeClientConfigurationService,
        private readonly logger: CoreLoggerService,
        @Inject("StripeClient")
        private readonly clientInstance: Stripe,
        @InjectQueue("stripe-events")
        private queue: Queue
    ) {}

    public async handleWebhook(
        request: RawBodyRequest<Request>
    ): Promise<void> {
        const signature = request.headers["stripe-signature"];

        if (!signature) {
            throw new Error("No stripe signature found in webhook request");
        }

        try {
            const event = this.clientInstance.webhooks.constructEvent(
                request.rawBody as Buffer, // is a buffer according to nest docs
                signature,
                this.config.webhookVerificationKey
            );

            await this.queue.add(event);
        } catch (error) {
            this.logger.error(`Webhook signature verification failed.`, error);
            throw new BadRequestException(
                "Webhook signature verification failed."
            );
        }
    }
}
