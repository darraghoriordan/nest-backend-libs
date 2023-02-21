import {BullModule} from "@nestjs/bull";
import {Module} from "@nestjs/common";
import {ConfigModule} from "@nestjs/config";
import {TypeOrmModule} from "@nestjs/typeorm";
import {SmtpEmailClient} from "./email-client.service";
import {EmailClientController} from "./email.controller";
import {Email} from "./email.entity";
import {EmailTransporterProvider} from "./EmailTransporterProvider";
import {EmailConfigurationService} from "./EmailConfigurationService";
import configVariables from "./EmailConfigurationVariables";
import {SmtpEmailHandler} from "./smtp-email-handler";

@Module({
    imports: [
        ConfigModule.forFeature(configVariables),
        TypeOrmModule.forFeature([Email]),
        BullModule.registerQueueAsync({
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
    exports: [SmtpEmailClient, BullModule],
})
export class SmtpEmailClientModule {}
