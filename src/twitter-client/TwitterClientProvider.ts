import {TwitterApi, TwitterApiReadWrite} from "twitter-api-v2";
import {TwitterClientConfigurationService} from "./TwitterClientConfigurationService";

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
