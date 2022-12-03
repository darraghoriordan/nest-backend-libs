import {Module} from "@nestjs/common";
import {ConfigModule} from "@nestjs/config";
import {TypeOrmModule} from "@nestjs/typeorm";
import {LoggerModule} from "../logger/logger.module";
import {SmtpEmailClient} from "./email-client.service";
import {EmailClientController} from "./email.controller";
import {Email} from "./email.entity";
import {EmailClientProvider} from "./EmailClientProvider";
import {EmailConfigurationService} from "./EmailConfigurationService";
import configVariables from "./EmailConfigurationVariables";

@Module({
    imports: [
        ConfigModule.forFeature(configVariables),
        LoggerModule,
        TypeOrmModule.forFeature([Email]),
    ],
    providers: [
        EmailClientProvider,
        SmtpEmailClient,
        EmailConfigurationService,
    ],
    controllers: [EmailClientController],
    exports: [SmtpEmailClient],
})
export class SmtpEmailClientModule {}
