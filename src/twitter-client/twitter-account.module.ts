import {DynamicModule, Module} from "@nestjs/common";
import "reflect-metadata";
import {TwitterClientConfigurationService} from "./TwitterClientConfigurationService.js";
import {TwitterClientService} from "./services/twitter-client.service.js";
import {TwitterClientProvider} from "./TwitterClientProvider.js";
import {
    TWITTER_MODULE_OPTIONS,
    TwitterModuleAsyncOptions,
} from "./twitter-account.options.js";

@Module({})
export class TwitterAccountModule {
    static forRoot(): never {
        throw new Error(
            "TwitterAccountModule.forRoot() is not supported. Use forRootAsync() instead."
        );
    }

    static forRootAsync(options: TwitterModuleAsyncOptions): DynamicModule {
        return {
            module: TwitterAccountModule,
            global: options.isGlobal ?? false,
            imports: [...(options.imports || [])],
            providers: [
                {
                    provide: TWITTER_MODULE_OPTIONS,
                    useFactory: options.useFactory,
                    inject: options.inject || [],
                },
                TwitterClientConfigurationService,
                TwitterClientProvider,
                TwitterClientService,
            ],
            exports: [TwitterClientService],
        };
    }
}
