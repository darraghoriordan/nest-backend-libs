import {BullModule} from "@nestjs/bull";
import {Module} from "@nestjs/common";
import {ConfigModule} from "@nestjs/config";
import {TypeOrmModule} from "@nestjs/typeorm";
import {LoggerModule} from "../logger/logger.module";
import {SmtpEmailClient} from "./email-client.service";
import {EmailClientController} from "./email.controller";
import {Email} from "./email.entity";
import {EmailTransporterProvider} from "./EmailClientProvider";
import {EmailConfigurationService} from "./EmailConfigurationService";
import configVariables from "./EmailConfigurationVariables";
import {SmtpEmailHandler} from "./smtp-email-handler";

@Module({
    imports: [
        ConfigModule.forFeature(configVariables),
        LoggerModule,
        TypeOrmModule.forFeature([Email]),
        BullModule.registerQueue({
            name: "smtp-emails",
        }),
    ],
    providers: [
        EmailTransporterProvider,
        SmtpEmailClient,
        EmailConfigurationService,
        SmtpEmailHandler,
    ],
    controllers: [EmailClientController],
    exports: [SmtpEmailClient],
})
export class SmtpEmailClientModule {}
