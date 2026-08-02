import {Inject, Injectable, Logger} from "@nestjs/common";
import {
    STRIPE_PAYMENTS_TELEMETRY,
    StripePaymentsTelemetry,
    StripePaymentsTelemetryEvent,
} from "../stripe-payments.extensions.js";

@Injectable()
export class StripePaymentsTelemetryService {
    private readonly logger = new Logger(StripePaymentsTelemetryService.name);

    constructor(
        @Inject(STRIPE_PAYMENTS_TELEMETRY)
        private readonly telemetry: StripePaymentsTelemetry
    ) {}

    async record(event: StripePaymentsTelemetryEvent): Promise<void> {
        try {
            await this.telemetry.record(event);
        } catch (error) {
            this.logger.warn("Stripe payment telemetry sink failed", {
                eventName: event.name,
                error: error instanceof Error ? error.message : String(error),
            });
        }
    }
}
