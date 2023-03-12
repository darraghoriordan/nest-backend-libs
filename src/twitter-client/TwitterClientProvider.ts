import {TwitterClientConfigurationService} from "./TwitterClientConfigurationService.js";
import {TwitterApi} from "twitter-api-v2";
import type {TwitterApiReadWrite} from "twitter-api-v2";
export const TwitterClientProvider = {
    provide: "TwitterClient",
    useFactory: (
        config: TwitterClientConfigurationService
    ): TwitterApiReadWrite => {
        const fullClient: TwitterApi = new TwitterApi({
            accessSecret: config.accessSecret,
            accessToken: config.accessToken,
            appKey: config.appKey,
            appSecret: config.appSecret,
        });

        return fullClient.readWrite;
    },
    inject: [TwitterClientConfigurationService],
};
