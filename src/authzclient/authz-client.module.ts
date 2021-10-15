import {Module} from "@nestjs/common";
import {LoggerModule} from "../logger/logger.module";
import {AuthClientConfigurationService} from "./AuthClientConfigurationService";
import {AuthZClientService} from "./authz.service";
import configVariables from "./AuthClientConfigurationVariables";
import {ConfigModule} from "@nestjs/config";

@Module({
    imports: [LoggerModule, ConfigModule.forFeature(configVariables)],
    providers: [AuthZClientService, AuthClientConfigurationService],
    exports: [AuthZClientService],
})
export class AuthzClientModule {}
