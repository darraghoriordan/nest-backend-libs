import {DynamicModule, Module} from "@nestjs/common";
import "reflect-metadata";
import {StripeClientConfigurationService} from "./StripeClientConfigurationService.js";
import {StripeCheckoutService} from "./services/stripe-checkout.service.js";
import {StripeClientProvider} from "./StripeClientProvider.js";
import {BullModule} from "@nestjs/bullmq";
import {TypeOrmModule} from "@nestjs/typeorm";
import {StripeCheckoutEvent} from "./entities/stripe-checkout-event.entity.js";
import {StripeWebhookHandler} from "./services/stripe-webhook-handler.service.js";
import {StripeWebhookController} from "./controllers/stripe-webhook-controller.js";
import {StripeCustomerPortalController} from "./controllers/stripe-customer-portal-controller.js";
import {OrganisationSubscriptionsModule} from "../organisation-subscriptions/organisation-subscriptions.module.js";
import {PaymentSessionModule} from "../payment-sessions/payment-session.module.js";
import {StripeEventsController} from "./controllers/stripe-events-controller.js";
import {AuthenticatedStripeCheckoutService} from "./services/auth-stripe-checkout.service.js";
import SubscriptionRecordMapper from "./services/subscriptionRecord.mapper.js";
import {
    STRIPE_MODULE_OPTIONS,
    StripeModuleAsyncOptions,
} from "./stripe-account.options.js";

@Module({})
export class StripeAccountModule {
    static forRoot(): never {
        throw new Error(
            "StripeAccountModule.forRoot() is not supported. Use forRootAsync() instead."
        );
    }

    static forRootAsync(options: StripeModuleAsyncOptions): DynamicModule {
        return {
            module: StripeAccountModule,
            global: options.isGlobal ?? false,
            imports: [
                ...(options.imports ?? []),
                BullModule.registerQueueAsync({
                    name: "stripe-events",
                }),
                OrganisationSubscriptionsModule,
                PaymentSessionModule,
                TypeOrmModule.forFeature([StripeCheckoutEvent]),
            ],
            providers: [
                {
                    provide: STRIPE_MODULE_OPTIONS,
                    useFactory: options.useFactory,
                    inject: options.inject ?? [],
                },
                AuthenticatedStripeCheckoutService,
                StripeCheckoutService,
                StripeClientConfigurationService,
                StripeClientProvider,
                StripeWebhookHandler,
                SubscriptionRecordMapper,
            ],
            exports: [
                AuthenticatedStripeCheckoutService,
                BullModule,
                StripeCheckoutService,
                StripeClientProvider,
                StripeWebhookHandler,
                SubscriptionRecordMapper,
                TypeOrmModule,
            ],
            controllers: [
                StripeCustomerPortalController,
                StripeEventsController,
                StripeWebhookController,
            ],
        };
    }
}
