import {Module} from "@nestjs/common";
import {PassportModule} from "@nestjs/passport";
import {AuthConfigurationService} from "./config/AuthConfigurationService.js";
import {JwtStrategy} from "./strategies/authzstrategy.js";
import configVariables from "./config/AuthConfigurationVariables.js";
import {ConfigModule} from "@nestjs/config";
import {UserValidationService} from "./services/UserValidation.service.js";
import {TypeOrmModule} from "@nestjs/typeorm";
import {User} from "../user/entities/user.entity.js";
import {AuthzClientModule} from "../authzclient/authz-client.module.js";
import {ApiKeyStrategy} from "./strategies/apikeystrategy.js";
import {Invitation} from "../invitations/entities/invitation.entity.js";

@Module({
    imports: [
        AuthzClientModule,
        ConfigModule.forFeature(configVariables),
        PassportModule.register({defaultStrategy: "jwt"}),
        TypeOrmModule.forFeature([User, Invitation]),
    ],
    providers: [
        ApiKeyStrategy,
        AuthConfigurationService,
        JwtStrategy,
        UserValidationService,
    ],
    exports: [AuthConfigurationService, PassportModule],
})
export class AuthzModule {}
