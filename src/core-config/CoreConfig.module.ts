import {Module} from "@nestjs/common";
import {ConfigModule} from "@nestjs/config";
import {CoreConfigurationService} from "./CoreConfigurationService";
import configVariables from "./CoreConfigurationVariables";

@Module({
    imports: [ConfigModule.forFeature(configVariables)],
    exports: [CoreConfigurationService],
    providers: [CoreConfigurationService],
})
export class CoreConfigModule {}
