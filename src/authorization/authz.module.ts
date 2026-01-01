import {DynamicModule, Module} from "@nestjs/common";
import {PassportModule} from "@nestjs/passport";
import {AuthConfigurationService} from "./config/AuthConfigurationService.js";
import {JwtStrategy} from "./strategies/authzstrategy.js";
import {UserValidationService} from "./services/UserValidation.service.js";
import {TypeOrmModule} from "@nestjs/typeorm";
import {User} from "../user/entities/user.entity.js";
import {ApiKeyStrategy} from "./strategies/apikeystrategy.js";
import {Invitation} from "../invitations/entities/invitation.entity.js";
import {
    AUTHZ_MODULE_OPTIONS,
    AuthzModuleAsyncOptions,
} from "./authz.options.js";

@Module({})
export class AuthzModule {
    static forRoot(): never {
        throw new Error(
            "AuthzModule.forRoot() is not supported. Use forRootAsync() instead."
        );
    }

    static forRootAsync(options: AuthzModuleAsyncOptions): DynamicModule {
        return {
            module: AuthzModule,
            global: options.isGlobal ?? false,
            imports: [
                ...(options.imports || []),
                PassportModule.register({defaultStrategy: "jwt"}),
                TypeOrmModule.forFeature([User, Invitation]),
            ],
            providers: [
                {
                    provide: AUTHZ_MODULE_OPTIONS,
                    useFactory: options.useFactory,
                    inject: options.inject || [],
                },
                ApiKeyStrategy,
                AuthConfigurationService,
                JwtStrategy,
                UserValidationService,
            ],
            exports: [AuthConfigurationService, PassportModule],
        };
    }
}
