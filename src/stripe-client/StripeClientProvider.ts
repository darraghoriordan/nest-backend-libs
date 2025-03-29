import Stripe from "stripe";
import {StripeClientConfigurationService} from "./StripeClientConfigurationService.js";

export const StripeClientProvider = {
    provide: "StripeClient",
    useFactory: (config: StripeClientConfigurationService): Stripe => {
        const apiVersion = "2025-02-24.acacia";
        const appInfo = {
            name: "NestBackendLibs",
            url: "https://github.com/darraghoriordan/nest-backend-libs", // Optional
        };

        return new Stripe(config.accessToken, {apiVersion, appInfo});
    },
    inject: [StripeClientConfigurationService],
};
