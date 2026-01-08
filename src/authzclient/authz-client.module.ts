import {DynamicModule, Module} from "@nestjs/common";
import {AuthClientConfigurationService} from "./AuthClientConfigurationService.js";
import {AuthZClientService} from "./authz.service.js";
import {AuthzClientProvider as AuthZClientProvider} from "./AuthzClientProvider.js";
import {AuthzUserInfoProvider} from "./AuthzUserInfoProvider.js";
import {
    AUTHZ_CLIENT_MODULE_OPTIONS,
    AuthzClientModuleAsyncOptions,
} from "./authz-client.options.js";

@Module({})
export class AuthzClientModule {
    static forRoot(): never {
        throw new Error(
            "AuthzClientModule.forRoot() is not supported. Use forRootAsync() instead."
        );
    }

    static forRootAsync(options: AuthzClientModuleAsyncOptions): DynamicModule {
        return {
            module: AuthzClientModule,
            global: options.isGlobal ?? false,
            imports: [...(options.imports ?? [])],
            providers: [
                {
                    provide: AUTHZ_CLIENT_MODULE_OPTIONS,
                    useFactory: options.useFactory,
                    inject: options.inject ?? [],
                },
                AuthClientConfigurationService,
                AuthZClientProvider,
                AuthZClientService,
                AuthzUserInfoProvider,
            ],
            exports: [AuthZClientService],
        };
    }
}
