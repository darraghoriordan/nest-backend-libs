import {Module} from "@nestjs/common";
import {ConfigModule} from "@nestjs/config";
import {TypeOrmModule} from "@nestjs/typeorm";
import {LoggerModule} from "../logger/logger.module";
import {EmailClient} from "./email-client.service";
import {EmailClientController} from "./email.controller";
import {Email} from "./email.entity";
import {EmailConfigurationService} from "./EmailConfigurationService";
import configVariables from "./EmailConfigurationVariables";

@Module({
    imports: [
        ConfigModule.forFeature(configVariables),
        LoggerModule,
        TypeOrmModule.forFeature([Email]),
    ],
    providers: [EmailClient, EmailConfigurationService],
    controllers: [EmailClientController],
    exports: [EmailClient],
})
export class EmailClientModule {}
