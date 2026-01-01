import {Inject, Injectable} from "@nestjs/common";
import {IsDefined, IsString} from "class-validator";
import {ValidatedConfigurationService} from "../configuration/ValidatedConfigurationService.js";
import {
    TWITTER_MODULE_OPTIONS,
    TwitterModuleOptions,
} from "./twitter-account.options.js";

@Injectable()
export class TwitterClientConfigurationService extends ValidatedConfigurationService {
    constructor(
        @Inject(TWITTER_MODULE_OPTIONS)
        private options: TwitterModuleOptions
    ) {
        super();
    }

    @IsDefined()
    @IsString()
    get appSecret(): string {
        return this.options.appSecret;
    }

    @IsDefined()
    @IsString()
    get appKey(): string {
        return this.options.appKey;
    }

    @IsDefined()
    @IsString()
    get accessToken(): string {
        return this.options.accessToken;
    }

    @IsDefined()
    @IsString()
    get accessSecret(): string {
        return this.options.accessSecret;
    }
}
