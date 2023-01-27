import {registerAs} from "@nestjs/config";

export default registerAs("stripe-client", () => ({
    accessToken: process.env.STRIPE_ACCESS_TOKEN,
    webhookVerificationKey: process.env.STRIPE_WEBHOOK_VERIFICATION_KEY,
    stripeRedirectsBaseUrl: process.env.STRIPE_REDIRECTS_BASE_URL,
}));
