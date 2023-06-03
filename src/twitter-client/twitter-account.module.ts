import {Module} from "@nestjs/common";
import "reflect-metadata";
import {TwitterClientConfigurationService} from "./TwitterClientConfigurationService.js";
import {TwitterClientService} from "./services/twitter-client.service.js";
import configVariables from "./TwitterConfigurationVariables.js";
import {ConfigModule} from "@nestjs/config";
import {TwitterClientProvider} from "./TwitterClientProvider.js";

@Module({
    imports: [ConfigModule.forFeature(configVariables)],
    providers: [
        TwitterClientConfigurationService,
        TwitterClientProvider,
        TwitterClientService,
    ],
    exports: [TwitterClientService],
    controllers: [],
})
export class TwitterAccountModule {}
