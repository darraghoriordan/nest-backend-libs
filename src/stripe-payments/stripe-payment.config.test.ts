import {describe, expect, it} from "vitest";
import {
    createSecureStripeConfiguration,
    parseStripeProductCatalog,
} from "./stripe-payment.config.js";
import {SecureStripeProductService} from "./services/secure-stripe-product.service.js";

describe("secure Stripe payment configuration", () => {
    it("parses the server-side catalog and normalizes the redirect origin", () => {
        const result = createSecureStripeConfiguration({
            accessToken: "sk_test_secret",
            webhookVerificationKey: "whsec_secret",
            redirectsBaseUrl: "https://app.example.com/",
            products: parseStripeProductCatalog(
                JSON.stringify({
                    starter: {
                        priceId: "price_starter",
                        mode: "subscription",
                        internalSku: "starter",
                        displayName: "Starter",
                    },
                })
            ),
        });

        expect(result.redirectsBaseUrl).toBe("https://app.example.com");
        expect(result.products.get("starter")).toEqual({
            key: "starter",
            priceId: "price_starter",
            mode: "subscription",
            internalSku: "starter",
            displayName: "Starter",
        });
    });

    it("rejects duplicate price IDs so one price cannot map to two products", () => {
        expect(() =>
            createSecureStripeConfiguration({
                accessToken: "sk_test_secret",
                webhookVerificationKey: "whsec_secret",
                redirectsBaseUrl: "https://app.example.com",
                products: parseStripeProductCatalog(
                    JSON.stringify({
                        first: {priceId: "price_same", mode: "payment"},
                        second: {priceId: "price_same", mode: "payment"},
                    })
                ),
            })
        ).toThrow("Duplicate Stripe price ID");
    });

    it("requires a non-empty server-side catalog", () => {
        expect(() =>
            createSecureStripeConfiguration({
                accessToken: "sk_test_secret",
                webhookVerificationKey: "whsec_secret",
                redirectsBaseUrl: "https://app.example.com",
                products: [],
            })
        ).toThrow("at least one product");
    });

    it("only builds redirects on the configured origin", () => {
        const service = new SecureStripeProductService({
            accessToken: "sk_test_secret",
            webhookVerificationKey: "whsec_secret",
            redirectsBaseUrl: "https://app.example.com",
            products: new Map(),
        });

        expect(service.buildRedirectUrl("/dashboard")).toBe(
            "https://app.example.com/dashboard"
        );
        expect(() =>
            service.buildRedirectUrl("https://evil.example/steal")
        ).toThrow("Redirect path");
        expect(() => service.buildRedirectUrl("//evil.example/steal")).toThrow(
            "Redirect path"
        );
    });
});
