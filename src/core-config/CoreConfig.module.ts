import {DynamicModule, Module} from "@nestjs/common";
import {CoreConfigurationService} from "./CoreConfigurationService.js";
import {
    CORE_MODULE_OPTIONS,
    CoreModuleAsyncOptions,
} from "./core-config.options.js";

@Module({})
export class CoreConfigModule {
    static forRoot(): never {
        throw new Error(
            "CoreConfigModule.forRoot() is not supported. Use forRootAsync() instead."
        );
    }

    static forRootAsync(options: CoreModuleAsyncOptions): DynamicModule {
        return {
            module: CoreConfigModule,
            global: options.isGlobal ?? true,
            imports: [...(options.imports || [])],
            providers: [
                {
                    provide: CORE_MODULE_OPTIONS,
                    useFactory: options.useFactory,
                    inject: options.inject || [],
                },
                CoreConfigurationService,
            ],
            exports: [CoreConfigurationService, CORE_MODULE_OPTIONS],
        };
    }
}
