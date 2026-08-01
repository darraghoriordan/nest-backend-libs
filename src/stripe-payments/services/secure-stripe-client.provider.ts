import {Provider} from "@nestjs/common";
import Stripe from "stripe";
import {
    SECURE_STRIPE_CONFIGURATION,
    SecureStripeConfiguration,
} from "../stripe-payment.config.js";

export const secureStripeClientProvider: Provider = {
    provide: "SecureStripeClient",
    useFactory: (configuration: SecureStripeConfiguration): Stripe =>
        new Stripe(configuration.accessToken, {
            apiVersion: Stripe.API_VERSION,
            appInfo: {
                name: "Miller Secure Payments",
                url: "https://usemiller.dev",
            },
            maxNetworkRetries: 2,
        }),
    inject: [SECURE_STRIPE_CONFIGURATION],
};
