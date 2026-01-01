import {Inject, Injectable} from "@nestjs/common";
import {IsDefined, IsString} from "class-validator";
import {ValidatedConfigurationService} from "../configuration/ValidatedConfigurationService.js";
import {
    STRIPE_MODULE_OPTIONS,
    StripeModuleOptions,
} from "./stripe-account.options.js";

@Injectable()
export class StripeClientConfigurationService extends ValidatedConfigurationService {
    constructor(
        @Inject(STRIPE_MODULE_OPTIONS)
        private options: StripeModuleOptions
    ) {
        super();
    }

    @IsDefined()
    @IsString()
    get accessToken(): string {
        return this.options.accessToken;
    }

    @IsDefined()
    @IsString()
    get webhookVerificationKey(): string {
        return this.options.webhookVerificationKey;
    }

    @IsDefined()
    @IsString()
    get stripeRedirectsBaseUrl(): string {
        return this.options.stripeRedirectsBaseUrl;
    }
}
