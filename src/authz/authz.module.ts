import {forwardRef, Module} from "@nestjs/common";
import {PassportModule} from "@nestjs/passport";
import {LoggerModule} from "../logger/logger.module";
import {PersonModule} from "../person/person.module";
import {AuthConfigurationService} from "./AuthConfigurationService";
import {JwtStrategy} from "./authzstrategy";
import configVariables from "./AuthConfigurationVariables";
import {ConfigModule} from "@nestjs/config";

@Module({
    imports: [
        ConfigModule.forFeature(configVariables),
        PassportModule.register({defaultStrategy: "jwt"}),
        LoggerModule,
        forwardRef(() => PersonModule), // forwardRef is needed to avoid circular dependency (PersonModule imports AuthzModule
    ],
    providers: [JwtStrategy, AuthConfigurationService],
    exports: [PassportModule, AuthConfigurationService],
})
export class AuthzModule {}
