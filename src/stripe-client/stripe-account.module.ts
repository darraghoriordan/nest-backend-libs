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
import {StripeWebhookController} from "./stripe-webhook-controller";
import {StripeCustomerPortalController} from "./stripe-customer-portal-controller";

@Module({
    imports: [
        ConfigModule.forFeature(configVariables),
        TypeOrmModule.forFeature([StripeCheckoutEvent]),
        CoreModule,
        BullModule.registerQueue({
            name: "stripe-events",
        }),
    ],
    providers: [
        StripeClientProvider,
        StripeClientConfigurationService,
        StripeCheckoutService,
        StripeWebhookHandler,
    ],
    exports: [StripeCheckoutService],
    controllers: [StripeWebhookController, StripeCustomerPortalController],
})
export class StripeAccountModule {}
