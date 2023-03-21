import {Module} from "@nestjs/common";
import "reflect-metadata";
import {StripeClientConfigurationService} from "./StripeClientConfigurationService.js";
import {StripeCheckoutService} from "./services/stripe-checkout.service.js";
import configVariables from "./StripeConfigurationVariables.js";
import {ConfigModule} from "@nestjs/config";
import {CoreModule} from "../root-app/core-app.module.js";
import {StripeClientProvider} from "./StripeClientProvider.js";
import {BullModule} from "@nestjs/bull";
import {TypeOrmModule} from "@nestjs/typeorm";
import {StripeCheckoutEvent} from "./entities/stripe-checkout-event.entity.js";
import {StripeWebhookHandler} from "./services/stripe-webhook-handler.service.js";
import {StripeWebhookController} from "./controllers/stripe-webhook-controller.js";
import {StripeCustomerPortalController} from "./controllers/stripe-customer-portal-controller.js";
import {OrganisationSubscriptionsModule} from "../organisation-subscriptions/organisation-subscriptions.module.js";
import {PaymentSessionModule} from "../payment-sessions/payment-session.module.js";
import {StripeEventsController} from "./controllers/stripe-events-controller.js";
import {AuthenticatedStripeCheckoutService} from "./services/auth-stripe-checkout.service.js";

@Module({
    imports: [
        ConfigModule.forFeature(configVariables),
        TypeOrmModule.forFeature([StripeCheckoutEvent]),
        CoreModule,
        OrganisationSubscriptionsModule,
        BullModule.registerQueueAsync({
            name: "stripe-events",
        }),
        PaymentSessionModule,
    ],
    providers: [
        StripeClientProvider,
        StripeClientConfigurationService,
        StripeCheckoutService,
        AuthenticatedStripeCheckoutService,
        StripeWebhookHandler,
    ],
    exports: [
        TypeOrmModule,
        StripeCheckoutService,
        AuthenticatedStripeCheckoutService,
        BullModule,
        StripeWebhookHandler,
        StripeClientProvider,
    ],
    controllers: [
        StripeWebhookController,
        StripeCustomerPortalController,
        StripeEventsController,
    ],
})
export class StripeAccountModule {}
