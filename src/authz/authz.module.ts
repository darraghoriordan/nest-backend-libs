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

@Global()
@Module({
    imports: [
        ConfigModule.forFeature(configVariables),
        TypeOrmModule.forFeature([User]),
        PassportModule.register({defaultStrategy: "jwt"}),
        AuthzClientModule,
    ],
    providers: [JwtStrategy, AuthConfigurationService, UserValidationService],
    exports: [PassportModule, AuthConfigurationService],
})
export class AuthzModule {}
