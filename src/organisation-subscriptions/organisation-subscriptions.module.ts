import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {OrganisationSubscriptionService} from "./organisation-subscriptions.service.js";
import {Organisation} from "../organisation/entities/organisation.entity.js";
import {OrganisationSubscriptionsController} from "./organisation-subscriptions.controller.js";
import {OrganisationSubscriptionRecord} from "./entities/organisation-subscription.entity.js";
import {PaymentSessionModule} from "../payment-sessions/payment-session.module.js";
import {AllSubscriptionsController} from "./all-subscriptions.controller.js";
import {SubActivationQueueModule} from "./sub-activation-queue.module.js";

@Module({
    imports: [
        PaymentSessionModule,
        SubActivationQueueModule,
        TypeOrmModule.forFeature([
            Organisation,
            OrganisationSubscriptionRecord,
        ]),
    ],
    controllers: [
        AllSubscriptionsController,
        OrganisationSubscriptionsController,
    ],
    providers: [OrganisationSubscriptionService],
    exports: [OrganisationSubscriptionService],
})
export class OrganisationSubscriptionsModule {}
