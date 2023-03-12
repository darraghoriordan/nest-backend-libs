import {Global, Module} from "@nestjs/common";
import {ConfigModule} from "@nestjs/config";
import {LoggingConfigurationService} from "./LoggingConfigurationService.js";
import configVariables from "./LoggingConfigurationVariables.js";

@Global()
@Module({
    imports: [ConfigModule.forFeature(configVariables)],
    providers: [LoggingConfigurationService],
    exports: [LoggingConfigurationService],
})
export class LoggerModule {}
