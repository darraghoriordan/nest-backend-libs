import {Global, Module} from "@nestjs/common";
import {PassportModule} from "@nestjs/passport";
import {AuthConfigurationService} from "./AuthConfigurationService";
import {JwtStrategy} from "./authzstrategy";
import configVariables from "./AuthConfigurationVariables";
import {ConfigModule} from "@nestjs/config";
import {UserValidationService} from "./UserValidation.service";
import {TypeOrmModule} from "@nestjs/typeorm";
import {User} from "../user-internal/entities/user.entity";
import {AuthzClientModule} from "../authzclient/authz-client.module";
import {ApiKeyStrategy} from "./apikeystrategy";
import {InvitationModule} from "../invitations";

@Global()
@Module({
    imports: [
        ConfigModule.forFeature(configVariables),
        TypeOrmModule.forFeature([User]),
        PassportModule.register({defaultStrategy: "jwt"}),
        AuthzClientModule,
        InvitationModule,
    ],
    providers: [
        ApiKeyStrategy,
        JwtStrategy,
        AuthConfigurationService,
        UserValidationService,
        ApiKeyStrategy,
    ],
    exports: [PassportModule, AuthConfigurationService],
})
export class AuthzModule {}
