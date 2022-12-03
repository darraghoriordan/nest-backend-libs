import {Module} from "@nestjs/common";
import "reflect-metadata";
import {TwitterClientConfigurationService} from "./TwitterClientConfigurationService";
import {TwitterClientService} from "./services/twitter-client.service";
import configVariables from "./TwitterConfigurationVariables";
import {ConfigModule} from "@nestjs/config";
import {CoreModule} from "../root-app/core-app.module";
import {TwitterClientProvider} from "./TwitterClientProvider";

@Module({
    imports: [ConfigModule.forFeature(configVariables), CoreModule],
    providers: [
        TwitterClientProvider,
        TwitterClientConfigurationService,
        TwitterClientService,
    ],
    controllers: [],
})
export class TwitterAccountModule {}
