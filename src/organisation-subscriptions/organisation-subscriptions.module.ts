import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {OrganisationSubscriptionService} from "./organisation-subscriptions.service.js";
import {Organisation} from "../organisation/entities/organisation.entity.js";
import {OrganisationSubscriptionsController} from "./organisation-subscriptions.controller.js";
import {OrganisationSubscriptionRecord} from "./entities/organisation-subscription.entity.js";
import {PaymentSessionModule} from "../payment-sessions/payment-session.module.js";
import {AllSubscriptionsController} from "./all-subscriptions.controller.js";
import {BullModule} from "@nestjs/bull";

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Organisation,
            OrganisationSubscriptionRecord,
        ]),
        BullModule.registerQueueAsync({
            name: "subscription-activation-changed",
        }),
        PaymentSessionModule,
    ],
    controllers: [
        OrganisationSubscriptionsController,
        AllSubscriptionsController,
    ],
    providers: [OrganisationSubscriptionService],
    exports: [OrganisationSubscriptionService, BullModule],
})
export class OrganisationSubscriptionsModule {}
