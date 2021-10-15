import {Module} from "@nestjs/common";
import {PassportModule} from "@nestjs/passport";
import {LoggerModule} from "../logger/logger.module";
import {PersonModule} from "../person/person.module";
import {AuthConfigurationService} from "./AuthConfigurationService";
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
    providers: [JwtStrategy, AuthConfigurationService, DefaultAuthGuard],
    exports: [PassportModule, AuthConfigurationService, DefaultAuthGuard],
})
export class AuthzModule {}
