import {BullModule} from "@nestjs/bull";
import {Module} from "@nestjs/common";
import {ConfigModule} from "@nestjs/config";
import {TypeOrmModule} from "@nestjs/typeorm";
import {SmtpEmailClient} from "./email-client.service.js";
import {EmailClientController} from "./email.controller.js";
import {Email} from "./email.entity.js";
import {EmailTransporterProvider} from "./EmailTransporterProvider.js";
import {EmailConfigurationService} from "./EmailConfigurationService.js";
import configVariables from "./EmailConfigurationVariables.js";
import {SmtpEmailHandler} from "./smtp-email-handler.js";

@Module({
    imports: [
        BullModule.registerQueueAsync({
            name: "smtp-emails",
        }),
        ConfigModule.forFeature(configVariables),
        TypeOrmModule.forFeature([Email]),
    ],
    providers: [
        EmailConfigurationService,
        EmailTransporterProvider,
        SmtpEmailClient,
        SmtpEmailHandler,
    ],
    controllers: [EmailClientController],
    exports: [BullModule, SmtpEmailClient],
})
export class SmtpEmailClientModule {}
