/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {Injectable} from "@nestjs/common";
import {ConfigService} from "@nestjs/config";
import {IsDefined, IsString} from "class-validator";
import {ValidatedConfigurationService} from "../configuration/ValidatedConfigurationService.js";

@Injectable()
export class StripeClientConfigurationService extends ValidatedConfigurationService {
    constructor(private configService: ConfigService) {
        super();
    }

    @IsDefined()
    @IsString()
    get accessToken(): string {
        return this.configService.get<string>("stripe-client.accessToken")!;
    }

    @IsDefined()
    @IsString()
    get webhookVerificationKey(): string {
        return this.configService.get<string>(
            "stripe-client.webhookVerificationKey"
        )!;
    }

    @IsDefined()
    @IsString()
    get stripeRedirectsBaseUrl(): string {
        return this.configService.get<string>(
            "stripe-client.stripeRedirectsBaseUrl"
        )!;
    }
}
