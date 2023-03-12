import {Module} from "@nestjs/common";
import {ConfigModule} from "@nestjs/config";
import {CoreConfigurationService} from "./CoreConfigurationService.js";
import configVariables from "./CoreConfigurationVariables.js";

@Module({
    imports: [ConfigModule.forFeature(configVariables)],
    exports: [CoreConfigurationService],
    providers: [CoreConfigurationService],
})
export class CoreConfigModule {}
