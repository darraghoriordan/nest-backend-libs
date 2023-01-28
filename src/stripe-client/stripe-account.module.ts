import {Module} from "@nestjs/common";
import "reflect-metadata";
import {StripeClientConfigurationService} from "./StripeClientConfigurationService";
import {StripeCheckoutService} from "./services/stripe-checkout.service";
import configVariables from "./StripeConfigurationVariables";
import {ConfigModule} from "@nestjs/config";
import {CoreModule} from "../root-app/core-app.module";
import {StripeClientProvider} from "./StripeClientProvider";
import {BullModule} from "@nestjs/bull";
import {StripeClientController} from "./stripe-controller";
import {TypeOrmModule} from "@nestjs/typeorm";
import {StripeCheckoutEvent} from "./entities/stripe-checkout-event.entity";

export const queueName = "stripe-events";
@Module({
    imports: [
        ConfigModule.forFeature(configVariables),
        TypeOrmModule.forFeature([StripeCheckoutEvent]),
        CoreModule,
        BullModule.registerQueue({
            name: queueName,
        }),
    ],
    providers: [
        StripeClientProvider,
        StripeClientConfigurationService,
        StripeCheckoutService,
    ],
    exports: [StripeCheckoutService],
    controllers: [StripeClientController],
})
export class StripeAccountModule {}
