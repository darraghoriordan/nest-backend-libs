import {Global, Module} from "@nestjs/common";
import {ConfigModule} from "@nestjs/config";
import CoreLoggerService from "./CoreLoggerService";
import {LoggingConfigurationService} from "./LoggingConfigurationService";
import configVariables from "./LoggingConfigurationVariables";
import {LoggingInterceptor} from "./LoggingInterceptor";

@Global()
@Module({
    imports: [ConfigModule.forFeature(configVariables)],
    providers: [
        LoggingConfigurationService,
        CoreLoggerService,
        LoggingInterceptor,
    ],
    exports: [CoreLoggerService, LoggingInterceptor],
})
export class LoggerModule {}
