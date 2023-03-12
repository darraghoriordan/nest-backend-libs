import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {PaymentSessionReference} from "./payment-session.entity.js";
import {PaymentSessionService} from "./payment-session.service.js";
import {PaymentSessionReferenceController} from "./payment-session.controller.js";

@Module({
    imports: [TypeOrmModule.forFeature([PaymentSessionReference])],
    providers: [PaymentSessionService],
    exports: [PaymentSessionService],
    controllers: [PaymentSessionReferenceController],
})
export class PaymentSessionModule {}
