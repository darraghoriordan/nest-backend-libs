import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {OrganisationSubscriptionService} from "./organisation-subscriptions.service";
import {Organisation} from "../organisation/entities/organisation.entity";
import {OrganisationSubscriptionsController} from "./organisation-subscriptions.controller";
import {OrganisationSubscriptionRecord} from "./entities/organisation-subscription.entity";
import {PaymentSessionModule} from "../payment-sessions/payment-session.module";
import {AllSubscriptionsController} from "./all-subscriptions.controller";

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Organisation,
            OrganisationSubscriptionRecord,
        ]),
        PaymentSessionModule,
    ],
    controllers: [
        OrganisationSubscriptionsController,
        AllSubscriptionsController,
    ],
    providers: [OrganisationSubscriptionService],
    exports: [OrganisationSubscriptionService],
})
export class OrganisationSubscriptionsModule {}
