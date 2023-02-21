import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {PaymentSessionReference} from "./payment-session.entity";
import {PaymentSessionService} from "./payment-session.service";
import {PaymentSessionReferenceController} from "./payment-session.controller";

@Module({
    imports: [TypeOrmModule.forFeature([PaymentSessionReference])],
    providers: [PaymentSessionService],
    exports: [PaymentSessionService],
    controllers: [PaymentSessionReferenceController],
})
export class PaymentSessionModule {}
