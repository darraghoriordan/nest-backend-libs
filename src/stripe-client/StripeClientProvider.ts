import Stripe from "stripe";
import {StripeClientConfigurationService} from "./StripeClientConfigurationService.js";

export const StripeClientProvider = {
    provide: "StripeClient",
    useFactory: (config: StripeClientConfigurationService) => {
        const apiVersion: Stripe.LatestApiVersion = Stripe.API_VERSION;
        const appInfo = {
            name: "NestBackendLibs",
            url: "https://github.com/darraghoriordan/nest-backend-libs", // Optional
        };

        return new Stripe(config.accessToken, {apiVersion, appInfo});
    },
    inject: [StripeClientConfigurationService],
};
