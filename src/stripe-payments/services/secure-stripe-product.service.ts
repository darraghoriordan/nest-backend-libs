import {BadRequestException, Inject, Injectable} from "@nestjs/common";
import {
    SECURE_STRIPE_CONFIGURATION,
    SecureStripeConfiguration,
    SecureStripeProduct,
} from "../stripe-payment.config.js";

@Injectable()
export class SecureStripeProductService {
    constructor(
        @Inject(SECURE_STRIPE_CONFIGURATION)
        private readonly configuration: SecureStripeConfiguration
    ) {}

    getByKey(productKey: string): SecureStripeProduct {
        const product = this.configuration.products.get(productKey);
        if (!product) {
            throw new BadRequestException("Unknown payment product");
        }
        return product;
    }

    getByPriceId(priceId: string): SecureStripeProduct {
        const product = [...this.configuration.products.values()].find(
            (candidate) => candidate.priceId === priceId
        );
        if (!product) {
            throw new Error(
                "Stripe returned a price outside the configured catalog"
            );
        }
        return product;
    }

    getConfiguredProducts(): readonly SecureStripeProduct[] {
        return [...this.configuration.products.values()];
    }

    buildRedirectUrl(path: string): string {
        const url = new URL(path, `${this.configuration.redirectsBaseUrl}/`);
        const baseUrl = new URL(`${this.configuration.redirectsBaseUrl}/`);
        if (
            url.origin !== baseUrl.origin ||
            !path.startsWith("/") ||
            path.startsWith("//")
        ) {
            throw new BadRequestException(
                "Redirect path must remain on the configured application origin"
            );
        }
        return url.toString();
    }
}
