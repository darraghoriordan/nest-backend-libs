import {Module} from "@nestjs/common";
import "reflect-metadata";
import {TwitterClientConfigurationService} from "./TwitterClientConfigurationService";
import {TwitterClientService} from "./services/twitter-client.service";
import configVariables from "./TwitterConfigurationVariables";
import {ConfigModule} from "@nestjs/config";
import {TwitterClientProvider} from "./TwitterClientProvider";

@Module({
    imports: [ConfigModule.forFeature(configVariables)],
    providers: [
        TwitterClientProvider,
        TwitterClientConfigurationService,
        TwitterClientService,
    ],
    exports: [TwitterClientService],
    controllers: [],
})
export class TwitterAccountModule {}
