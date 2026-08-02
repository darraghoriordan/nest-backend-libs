import {BullModule} from "@nestjs/bullmq";
import {DynamicModule, Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {Organisation} from "../organisation/entities/organisation.entity.js";
import {OrganisationSubscriptionsModule} from "../organisation-subscriptions/organisation-subscriptions.module.js";
import {OrganisationSubscriptionRecord} from "../organisation-subscriptions/entities/organisation-subscription.entity.js";
import {SubActivationQueueModule} from "../organisation-subscriptions/sub-activation-queue.module.js";
import {PaymentSessionModule} from "../payment-sessions/payment-session.module.js";
import {StripeCheckoutAttempt} from "./entities/stripe-checkout-attempt.entity.js";
import {StripeCheckoutEvent} from "./entities/stripe-payment-event.entity.js";
import {StripePaymentState} from "./entities/stripe-payment-state.entity.js";
import {SecureStripeCheckoutController} from "./controllers/secure-stripe-checkout.controller.js";
import {SecureStripeEventsController} from "./controllers/secure-stripe-events.controller.js";
import {SecureStripeWebhookController} from "./controllers/secure-stripe-webhook.controller.js";
import {secureStripeConfigurationProvider} from "./stripe-payment.config.js";
import {
    STRIPE_PAYMENTS_OPTIONS,
    StripePaymentsModuleAsyncOptions,
} from "./stripe-payments.options.js";
import {secureStripeClientProvider} from "./services/secure-stripe-client.provider.js";
import {SecureStripeCheckoutService} from "./services/secure-stripe-checkout.service.js";
import {SecureStripeProductService} from "./services/secure-stripe-product.service.js";
import {SecureStripeWebhookService} from "./services/secure-stripe-webhook.service.js";
import {SecureSubscriptionService} from "./services/secure-subscription.service.js";
import {StripePaymentEventProcessor} from "./services/stripe-payment-event.processor.js";
import {StripePaymentEventService} from "./services/stripe-payment-event.service.js";
import {StripePaymentFulfillmentService} from "./services/stripe-payment-fulfillment.service.js";
import {
    DefaultStripePaymentsAccessPolicy,
    NoopStripePaymentsTelemetry,
    STRIPE_PAYMENTS_ACCESS_POLICY,
    STRIPE_PAYMENTS_ENTITLEMENT_STORE,
    STRIPE_PAYMENTS_TELEMETRY,
} from "./stripe-payments.extensions.js";
import {StripePaymentsTelemetryService} from "./services/stripe-payments-telemetry.service.js";
import {StripePaymentsOperationsService} from "./services/stripe-payments-operations.service.js";
import {DefaultStripePaymentsEntitlementStore} from "./services/default-stripe-payments-entitlement-store.js";

/**
 * Opinionated Stripe payments for organisation-based applications.
 *
 * The module owns the Stripe boundary, product catalog, idempotency records,
 * durable webhook inbox, retries, replay, and subscription state updates.
 * Applications provide only their server-side Stripe configuration and catalog.
 */
@Module({})
export class StripePaymentsModule {
    static forRootAsync(
        options: StripePaymentsModuleAsyncOptions
    ): DynamicModule {
        return {
            module: StripePaymentsModule,
            global: options.isGlobal ?? false,
            imports: [
                ...(options.imports ?? []),
                BullModule.registerQueue({name: "stripe-events"}),
                OrganisationSubscriptionsModule,
                SubActivationQueueModule,
                PaymentSessionModule,
                TypeOrmModule.forFeature([
                    Organisation,
                    OrganisationSubscriptionRecord,
                    StripeCheckoutAttempt,
                    StripeCheckoutEvent,
                    StripePaymentState,
                ]),
            ],
            providers: [
                {
                    provide: STRIPE_PAYMENTS_OPTIONS,
                    useFactory: options.useFactory,
                    inject: options.inject ?? [],
                },
                secureStripeConfigurationProvider,
                secureStripeClientProvider,
                SecureStripeProductService,
                SecureStripeCheckoutService,
                SecureSubscriptionService,
                DefaultStripePaymentsEntitlementStore,
                StripePaymentEventService,
                SecureStripeWebhookService,
                StripePaymentFulfillmentService,
                StripePaymentEventProcessor,
                StripePaymentsTelemetryService,
                StripePaymentsOperationsService,
                {
                    provide: STRIPE_PAYMENTS_ACCESS_POLICY,
                    useClass: DefaultStripePaymentsAccessPolicy,
                },
                {
                    provide: STRIPE_PAYMENTS_TELEMETRY,
                    useClass: NoopStripePaymentsTelemetry,
                },
                {
                    provide: STRIPE_PAYMENTS_ENTITLEMENT_STORE,
                    useExisting: DefaultStripePaymentsEntitlementStore,
                },
                ...(options.providers ?? []),
            ],
            controllers: [
                SecureStripeCheckoutController,
                SecureStripeEventsController,
                SecureStripeWebhookController,
            ],
            exports: [
                BullModule,
                SecureStripeProductService,
                SecureStripeCheckoutService,
                SecureSubscriptionService,
                StripePaymentEventService,
                StripePaymentsOperationsService,
                StripePaymentsTelemetryService,
                STRIPE_PAYMENTS_ACCESS_POLICY,
                STRIPE_PAYMENTS_ENTITLEMENT_STORE,
                STRIPE_PAYMENTS_TELEMETRY,
            ],
        };
    }
}
