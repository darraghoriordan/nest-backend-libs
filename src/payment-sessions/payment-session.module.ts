import {Module} from "@nestjs/common";
import {CoreModule} from "../root-app/core-app.module";
import {TypeOrmModule} from "@nestjs/typeorm";
import {PaymentSessionReference} from "./payment-session.entity";
import {PaymentSessionService} from "./payment-session.service";

@Module({
    imports: [TypeOrmModule.forFeature([PaymentSessionReference]), CoreModule],
    providers: [PaymentSessionService],
    exports: [PaymentSessionService],
    controllers: [],
})
export class PaymentSessionModule {}
