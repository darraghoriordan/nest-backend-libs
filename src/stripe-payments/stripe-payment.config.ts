import {Provider} from "@nestjs/common";
import {
    STRIPE_PAYMENTS_OPTIONS,
    StripePaymentsModuleOptions,
    StripePaymentsMode,
    StripePaymentsProduct,
} from "./stripe-payments.options.js";

export interface SecureStripeProduct {
    key: string;
    priceId: string;
    mode: StripePaymentsMode;
    internalSku: string;
    displayName: string;
}

export interface SecureStripeConfiguration {
    accessToken: string;
    webhookVerificationKey: string;
    redirectsBaseUrl: string;
    products: ReadonlyMap<string, SecureStripeProduct>;
}

export const SECURE_STRIPE_CONFIGURATION = "SecureStripeConfiguration";

export const secureStripeConfigurationProvider: Provider = {
    provide: SECURE_STRIPE_CONFIGURATION,
    inject: [STRIPE_PAYMENTS_OPTIONS],
    useFactory: (
        options: StripePaymentsModuleOptions
    ): SecureStripeConfiguration => createSecureStripeConfiguration(options),
};

function parseProduct(product: StripePaymentsProduct): SecureStripeProduct {
    const mode = product.mode as string;
    if (
        !/^[a-z0-9][a-z0-9_-]{0,63}$/.test(product.key) ||
        !/^price_[A-Za-z0-9]+$/.test(product.priceId) ||
        (mode !== "subscription" && mode !== "payment")
    ) {
        throw new Error(`Invalid Stripe product configuration: ${product.key}`);
    }

    return {
        key: product.key,
        priceId: product.priceId,
        mode,
        internalSku: product.internalSku ?? product.key,
        displayName: product.displayName ?? product.key,
    };
}

export function parseStripeProductCatalog(
    value: string
): StripePaymentsProduct[] {
    let parsed: unknown;
    try {
        parsed = JSON.parse(value) as unknown;
    } catch (error) {
        throw new Error("Stripe product catalog must contain valid JSON", {
            cause: error,
        });
    }

    if (
        typeof parsed !== "object" ||
        parsed === null ||
        Array.isArray(parsed)
    ) {
        throw new Error(
            "Stripe product catalog must be an object keyed by product key"
        );
    }

    return Object.entries(parsed).map(([key, product]) => {
        if (typeof product !== "object" || product === null) {
            throw new Error(`Invalid Stripe product configuration: ${key}`);
        }
        const candidate = product as Partial<StripePaymentsProduct>;
        return {
            key,
            priceId: candidate.priceId ?? "",
            mode: candidate.mode ?? "payment",
            internalSku: candidate.internalSku,
            displayName: candidate.displayName,
        };
    });
}

export function createSecureStripeConfiguration(
    options: StripePaymentsModuleOptions
): SecureStripeConfiguration {
    if (!options.accessToken) {
        throw new Error("Stripe accessToken is required");
    }
    if (!options.webhookVerificationKey) {
        throw new Error("Stripe webhookVerificationKey is required");
    }
    if (!Array.isArray(options.products) || options.products.length === 0) {
        throw new Error("Stripe products must contain at least one product");
    }
    const products: readonly StripePaymentsProduct[] = options.products;

    let redirectsBaseUrl: URL;
    try {
        redirectsBaseUrl = new URL(options.redirectsBaseUrl);
    } catch (error) {
        throw new Error("Stripe redirectsBaseUrl must be a valid URL", {
            cause: error,
        });
    }
    if (
        !/^https?:$/.test(redirectsBaseUrl.protocol) ||
        redirectsBaseUrl.pathname !== "/" ||
        redirectsBaseUrl.search ||
        redirectsBaseUrl.hash
    ) {
        throw new Error(
            "Stripe redirectsBaseUrl must contain only an HTTP(S) origin"
        );
    }

    const productsByKey = new Map<string, SecureStripeProduct>();
    const priceIds = new Set<string>();
    for (const productInput of products) {
        const product = parseProduct(productInput);
        if (productsByKey.has(product.key)) {
            throw new Error(`Duplicate Stripe product key: ${product.key}`);
        }
        if (priceIds.has(product.priceId)) {
            throw new Error(`Duplicate Stripe price ID: ${product.priceId}`);
        }
        productsByKey.set(product.key, product);
        priceIds.add(product.priceId);
    }

    return {
        accessToken: options.accessToken,
        webhookVerificationKey: options.webhookVerificationKey,
        redirectsBaseUrl: redirectsBaseUrl.origin,
        products: productsByKey,
    };
}
