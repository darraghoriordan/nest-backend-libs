import {describe, it, expect, beforeEach} from "vitest";
import SubscriptionRecordMapper from "./subscriptionRecord.mapper";

describe("SubscriptionRecordMapper", () => {
    let mapper: SubscriptionRecordMapper;

    beforeEach(() => {
        mapper = new SubscriptionRecordMapper();
    });

    describe("mapPaymentType (via mapCheckoutSessionToSubRecord)", () => {
        // We test the private method behavior through the public method
        // by checking the paymentSystemMode in the output

        it("should map recurring type to subscription", () => {
            const mockSession = createMockCheckoutSession({
                mode: "payment",
                priceType: "recurring",
            });

            const result = mapper.mapCheckoutSessionToSubRecord(mockSession);

            expect(result[0].paymentSystemMode).toBe("subscription");
        });

        it("should map subscription mode to subscription", () => {
            const mockSession = createMockCheckoutSession({
                mode: "subscription",
                priceType: "one_time",
            });

            const result = mapper.mapCheckoutSessionToSubRecord(mockSession);

            expect(result[0].paymentSystemMode).toBe("subscription");
        });

        it("should map payment mode with one_time type to payment", () => {
            const mockSession = createMockCheckoutSession({
                mode: "payment",
                priceType: "one_time",
            });

            const result = mapper.mapCheckoutSessionToSubRecord(mockSession);

            expect(result[0].paymentSystemMode).toBe("payment");
        });
    });

    describe("mapNewValidUntil (via mapCheckoutSessionToSubRecord)", () => {
        it("should set validUntil 500 years in future for one-time payments", () => {
            const mockSession = createMockCheckoutSession({
                mode: "payment",
                priceType: "one_time",
            });

            const result = mapper.mapCheckoutSessionToSubRecord(mockSession);

            const now = new Date();
            const expectedMinYear = now.getFullYear() + 499;
            expect(result[0].validUntil.getFullYear()).toBeGreaterThan(
                expectedMinYear
            );
        });
    });

    describe("mapSubscriptionToSubRecord", () => {
        it("should correctly map subscription with cancel_at_period_end", () => {
            const cancelAt = Math.floor(Date.now() / 1000) + 86400 * 30; // 30 days from now
            const mockSubscription = createMockSubscription({
                cancelAtPeriodEnd: true,
                cancelAt,
            });

            const result = mapper.mapSubscriptionToSubRecord(mockSubscription, {
                isActive: true,
            });

            expect(result).toHaveLength(1);
            expect(result[0].paymentSystemMode).toBe("subscription");
            // Should be cancel_at + 2 days grace period
            const expectedDate = new Date((cancelAt + 2 * 24 * 60 * 60) * 1000);
            expect(result[0].validUntil.getTime()).toBeCloseTo(
                expectedDate.getTime(),
                -3 // within 1 second
            );
        });

        it("should correctly map product metadata to internalSku", () => {
            const mockSubscription = createMockSubscription({
                productMetadata: {internalSku: "pro-monthly"},
            });

            const result = mapper.mapSubscriptionToSubRecord(mockSubscription, {
                isActive: true,
            });

            expect(result[0].internalSku).toBe("pro-monthly");
        });

        it("should use customer email when available", () => {
            const mockSubscription = createMockSubscription({
                customerEmail: "test@example.com",
            });

            const result = mapper.mapSubscriptionToSubRecord(mockSubscription, {
                isActive: true,
            });

            expect(result[0].paymentSystemCustomerEmail).toBe(
                "test@example.com"
            );
        });

        it("should set paymentSystemName to stripe", () => {
            const mockSubscription = createMockSubscription({});

            const result = mapper.mapSubscriptionToSubRecord(mockSubscription, {
                isActive: true,
            });

            expect(result[0].paymentSystemName).toBe("stripe");
        });
    });
});

// Test helpers

interface MockCheckoutOptions {
    mode: "payment" | "subscription";
    priceType: "recurring" | "one_time";
}

function createMockCheckoutSession(options: MockCheckoutOptions) {
    const cancelAt = Math.floor(Date.now() / 1000) + 86400 * 30; // 30 days from now
    return {
        id: "cs_test_123",
        mode: options.mode,
        customer: {
            id: "cus_123",
            email: "customer@example.com",
        },
        customer_email: "customer@example.com",
        customer_details: {email: "customer@example.com"},
        client_reference_id: "ref-123",
        subscription: {
            id: "sub_123",
            cancel_at_period_end: true,
            cancel_at: cancelAt,
        },
        line_items: {
            data: [
                {
                    price: {
                        type: options.priceType,
                        product: {
                            id: "prod_123",
                            name: "Test Product",
                            metadata: {internalSku: "test-sku"},
                        },
                    },
                },
            ],
        },
    } as never;
}

interface MockSubscriptionOptions {
    cancelAtPeriodEnd?: boolean;
    cancelAt?: number;
    productMetadata?: Record<string, string>;
    customerEmail?: string;
}

function createMockSubscription(options: MockSubscriptionOptions) {
    const defaultCancelAt = Math.floor(Date.now() / 1000) + 86400 * 30; // 30 days from now
    return {
        id: "sub_123",
        cancel_at_period_end: options.cancelAtPeriodEnd ?? true,
        cancel_at: options.cancelAt ?? defaultCancelAt,
        customer: {
            id: "cus_123",
            email: options.customerEmail ?? "default@example.com",
        },
        items: {
            data: [
                {
                    price: {
                        type: "recurring",
                        product: {
                            id: "prod_123",
                            name: "Test Subscription",
                            metadata: options.productMetadata ?? {},
                        },
                    },
                },
            ],
        },
    } as never;
}
