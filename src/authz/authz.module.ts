import {Module} from "@nestjs/common";
import {PassportModule} from "@nestjs/passport";
import {LoggerModule} from "../logger/logger.module";
import {PersonModule} from "../person/person.module";
import {AuthConfigurationService} from "./AuthConfigurationService";
import {AuthZClientService} from "./authz.service";
import {JwtStrategy} from "./authzstrategy";
import configVariables from "./AuthConfigurationVariables";
import {ConfigModule} from "@nestjs/config";
import {DefaultAuthGuard} from "./DefaultAuthGuard";

@Module({
    imports: [
        ConfigModule.forFeature(configVariables),
        PassportModule.register({defaultStrategy: "jwt"}),
        LoggerModule,
        PersonModule,
    ],
    providers: [
        JwtStrategy,
        AuthZClientService,
        AuthConfigurationService,
        DefaultAuthGuard,
    ],
    exports: [
        PassportModule,
        AuthZClientService,
        AuthConfigurationService,
        DefaultAuthGuard,
    ],
})
export class AuthzModule {}
