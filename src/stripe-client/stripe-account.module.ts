import {Module} from "@nestjs/common";
import "reflect-metadata";
import {StripeClientConfigurationService} from "./StripeClientConfigurationService";
import {StripeCheckoutService} from "./services/stripe-checkout.service";
import configVariables from "./StripeConfigurationVariables";
import {ConfigModule} from "@nestjs/config";
import {CoreModule} from "../root-app/core-app.module";
import {StripeClientProvider} from "./StripeClientProvider";
import {BullModule} from "@nestjs/bull";
import {TypeOrmModule} from "@nestjs/typeorm";
import {StripeCheckoutEvent} from "./entities/stripe-checkout-event.entity";
import {StripeWebhookHandler} from "./services/stripe-webhook-handler.service";
import {StripeWebhookController} from "./controllers/stripe-webhook-controller";
import {StripeCustomerPortalController} from "./controllers/stripe-customer-portal-controller";
import {OrganisationSubscriptionsModule} from "../organisation-subscriptions/organisation-subscriptions.module";
import {PaymentSessionModule} from "../payment-sessions/payment-session.module";
import {StripeEventsController} from "./controllers/stripe-events-controller";

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
        StripeWebhookHandler,
    ],
    exports: [
        TypeOrmModule,
        StripeCheckoutService,
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
