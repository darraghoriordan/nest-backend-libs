import {
    BadRequestException,
    Inject,
    Injectable,
    ServiceUnavailableException,
} from "@nestjs/common";
import Stripe from "stripe";
import {
    SECURE_STRIPE_CONFIGURATION,
    SecureStripeConfiguration,
} from "../stripe-payment.config.js";
import {StripePaymentEventService} from "./stripe-payment-event.service.js";

export interface RawStripeWebhookRequest {
    headers: Record<string, string | string[] | undefined>;
    rawBody?: Buffer;
}

@Injectable()
export class SecureStripeWebhookService {
    constructor(
        @Inject("SecureStripeClient")
        private readonly stripe: Stripe,
        @Inject(SECURE_STRIPE_CONFIGURATION)
        private readonly configuration: SecureStripeConfiguration,
        private readonly paymentEventService: StripePaymentEventService
    ) {}

    async handleWebhook(request: RawStripeWebhookRequest): Promise<void> {
        if (!request.rawBody) {
            throw new BadRequestException(
                "Webhook body was not received as raw bytes"
            );
        }
        const signatureHeader = request.headers["stripe-signature"];
        if (typeof signatureHeader !== "string") {
            throw new BadRequestException("Missing Stripe webhook signature");
        }

        let event: Stripe.Event;
        try {
            event = this.stripe.webhooks.constructEvent(
                request.rawBody,
                signatureHeader,
                this.configuration.webhookVerificationKey
            );
        } catch {
            throw new BadRequestException("Invalid Stripe webhook signature");
        }

        try {
            await this.paymentEventService.receive(event);
        } catch {
            // A non-2xx response tells Stripe to retry delivery. The event row is
            // deliberately durable so a later delivery can enqueue it again.
            throw new ServiceUnavailableException(
                "Payment event could not be queued"
            );
        }
    }
}
