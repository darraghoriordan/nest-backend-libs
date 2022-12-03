import {registerAs} from "@nestjs/config";

export default registerAs("twitter-client", () => ({
    accessSecret: process.env.TWITTER_ACCESS_SECRET,
    accessToken: process.env.TWITTER_ACCESS_TOKEN,
    appKey: process.env.TWITTER_APP_KEY,
    appSecret: process.env.TWITTER_APP_SECRET,
}));
