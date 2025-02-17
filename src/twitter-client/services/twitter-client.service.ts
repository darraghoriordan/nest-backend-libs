/* eslint-disable @typescript-eslint/naming-convention */
import {Inject, Injectable, Logger} from "@nestjs/common";
//import {EUploadMimeType, TwitterApiReadWrite} from "twitter-api-v2";
import type {TwitterApiReadWrite, EUploadMimeType} from "twitter-api-v2";

@Injectable()
export class TwitterClientService {
    private readonly logger = new Logger(TwitterClientService.name);
    constructor(
        @Inject("TwitterClient")
        private readonly clientInstance: TwitterApiReadWrite
    ) {
        this.logger.log("Setting up twitter client");
    }

    public async uploadMedia(
        bytes: string,
        type: EUploadMimeType
    ): Promise<string> {
        return this.clientInstance.v1.uploadMedia(
            Buffer.from(bytes, "binary"),
            {mimeType: type}
        );
    }

    public async sendTweet(
        message: string,
        mediaIds?:
            | [string]
            | [string, string]
            | [string, string, string]
            | [string, string, string, string]
    ): Promise<void> {
        await this.clientInstance.v2.tweet(message, {
            media: {media_ids: mediaIds},
        });
    }
}
