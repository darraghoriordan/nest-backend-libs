import Stripe from "stripe";
import {StripeClientConfigurationService} from "./StripeClientConfigurationService.js";

export const StripeClientProvider = {
    provide: "StripeClient",
    useFactory: (config: StripeClientConfigurationService): Stripe => {
        const apiVersion = "2025-01-27.acacia";
        const appInfo = {
            name: "NestBackendLibs",
            url: "https://github.com/darraghoriordan/nest-backend-libs", // Optional
        };
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
        return new Stripe(config.accessToken, {apiVersion, appInfo});
    },
    inject: [StripeClientConfigurationService],
};
