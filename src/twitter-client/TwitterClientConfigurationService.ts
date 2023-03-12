/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {Injectable} from "@nestjs/common";
import {ConfigService} from "@nestjs/config";
import {IsDefined, IsString} from "class-validator";
import {ValidatedConfigurationService} from "../configuration/ValidatedConfigurationService.js";

@Injectable()
export class TwitterClientConfigurationService extends ValidatedConfigurationService {
    constructor(private configService: ConfigService) {
        super();
    }

    @IsDefined()
    @IsString()
    get appSecret(): string {
        return this.configService.get<string>("twitter-client.appSecret")!;
    }
    @IsDefined()
    @IsString()
    get appKey(): string {
        return this.configService.get<string>("twitter-client.appKey")!;
    }
    @IsDefined()
    @IsString()
    get accessToken(): string {
        return this.configService.get<string>("twitter-client.accessToken")!;
    }
    @IsDefined()
    @IsString()
    get accessSecret(): string {
        return this.configService.get<string>("twitter-client.accessSecret")!;
    }
}
