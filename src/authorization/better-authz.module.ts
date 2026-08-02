import {DynamicModule, Module} from "@nestjs/common";
import {PassportModule} from "@nestjs/passport";
import {TypeOrmModule} from "@nestjs/typeorm";
import {Invitation} from "../invitations/entities/invitation.entity.js";
import {User} from "../user/entities/user.entity.js";
import {
    BETTER_AUTHZ_MODULE_OPTIONS,
    type BetterAuthzModuleAsyncOptions,
} from "./better-authz.options.js";
import {BetterAuthConfigurationService} from "./config/BetterAuthConfigurationService.js";
import {BetterAuthApiKeyStrategy} from "./strategies/better-auth-apikey.strategy.js";
import {BetterAuthStrategy} from "./strategies/better-auth.strategy.js";
import {BetterAuthUserValidationService} from "./services/BetterAuthUserValidation.service.js";

/**
 * Provider-neutral session authorization module designed for Better Auth.
 * It preserves the existing `DefaultAuthGuard` contract used by controllers.
 */
@Module({})
export class BetterAuthzModule {
    static forRoot(): never {
        throw new Error(
            "BetterAuthzModule.forRoot() is not supported. Use forRootAsync() instead."
        );
    }

    static forRootAsync(options: BetterAuthzModuleAsyncOptions): DynamicModule {
        return {
            module: BetterAuthzModule,
            global: options.isGlobal ?? false,
            imports: [
                ...(options.imports ?? []),
                PassportModule.register({defaultStrategy: "jwt"}),
                TypeOrmModule.forFeature([User, Invitation]),
            ],
            providers: [
                {
                    provide: BETTER_AUTHZ_MODULE_OPTIONS,
                    useFactory: options.useFactory,
                    inject: options.inject ?? [],
                },
                BetterAuthApiKeyStrategy,
                BetterAuthConfigurationService,
                BetterAuthStrategy,
                BetterAuthUserValidationService,
            ],
            exports: [BetterAuthConfigurationService, PassportModule],
        };
    }
}
