import {DynamicModule, Global, Module} from "@nestjs/common";
import {LoggingConfigurationService} from "./LoggingConfigurationService.js";
import {
    LOGGER_MODULE_OPTIONS,
    LoggerModuleAsyncOptions,
} from "./logger.options.js";

@Global()
@Module({})
export class LoggerModule {
    static forRoot(): never {
        throw new Error(
            "LoggerModule.forRoot() is not supported. Use forRootAsync() instead."
        );
    }

    static forRootAsync(options: LoggerModuleAsyncOptions): DynamicModule {
        return {
            module: LoggerModule,
            global: options.isGlobal ?? true,
            imports: [...(options.imports ?? [])],
            providers: [
                {
                    provide: LOGGER_MODULE_OPTIONS,
                    useFactory: options.useFactory,
                    inject: options.inject ?? [],
                },
                LoggingConfigurationService,
            ],
            exports: [LoggingConfigurationService],
        };
    }
}
