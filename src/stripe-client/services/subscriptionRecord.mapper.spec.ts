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

        it("should handle null subscription for one-time payments", () => {
            const mockSession = createMockCheckoutSession({
                mode: "payment",
                priceType: "one_time",
                subscription: null,
            });

            const result = mapper.mapCheckoutSessionToSubRecord(mockSession);

            expect(result[0].paymentSystemMode).toBe("payment");
            // validUntil should be ~500 years in future
            const now = new Date();
            const expectedMinYear = now.getFullYear() + 499;
            expect(result[0].validUntil.getFullYear()).toBeGreaterThan(
                expectedMinYear
            );
        });

        it("should use current_period_end for active subscriptions without cancellation", () => {
            const currentPeriodEnd =
                Math.floor(Date.now() / 1000) + 86400 * 365; // 1 year from now
            const mockSession = createMockCheckoutSession({
                mode: "subscription",
                priceType: "recurring",
                subscription: {
                    id: "sub_123",
                    cancel_at_period_end: false,
                    cancel_at: null,
                    items: {
                        data: [
                            {
                                current_period_end: currentPeriodEnd,
                            },
                        ],
                    },
                },
            });

            const result = mapper.mapCheckoutSessionToSubRecord(mockSession);

            // Should be current_period_end + 2 days grace period
            const expectedDate = new Date(
                (currentPeriodEnd + 2 * 24 * 60 * 60) * 1000
            );
            expect(result[0].validUntil.getTime()).toBeCloseTo(
                expectedDate.getTime(),
                -3 // within 1 second
            );
        });

        it("should use cancel_at when cancellation is scheduled", () => {
            const cancelAt = Math.floor(Date.now() / 1000) + 86400 * 30; // 30 days from now
            const currentPeriodEnd =
                Math.floor(Date.now() / 1000) + 86400 * 365; // 1 year from now
            const mockSession = createMockCheckoutSession({
                mode: "subscription",
                priceType: "recurring",
                subscription: {
                    id: "sub_123",
                    cancel_at_period_end: true,
                    cancel_at: cancelAt,
                    items: {
                        data: [
                            {
                                current_period_end: currentPeriodEnd,
                            },
                        ],
                    },
                },
            });

            const result = mapper.mapCheckoutSessionToSubRecord(mockSession);

            // Should use cancel_at, not current_period_end
            const expectedDate = new Date((cancelAt + 2 * 24 * 60 * 60) * 1000);
            expect(result[0].validUntil.getTime()).toBeCloseTo(
                expectedDate.getTime(),
                -3 // within 1 second
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

        it("should use current_period_end when cancellation is not scheduled", () => {
            const currentPeriodEnd =
                Math.floor(Date.now() / 1000) + 86400 * 365; // 1 year from now
            const mockSubscription = createMockSubscription({
                cancelAtPeriodEnd: false,
                currentPeriodEnd,
            });

            const result = mapper.mapSubscriptionToSubRecord(mockSubscription, {
                isActive: true,
            });

            // Should be current_period_end + 2 days grace period
            const expectedDate = new Date(
                (currentPeriodEnd + 2 * 24 * 60 * 60) * 1000
            );
            expect(result[0].validUntil.getTime()).toBeCloseTo(
                expectedDate.getTime(),
                -3 // within 1 second
            );
        });

        it("should set validUntil to now for inactive subscriptions", () => {
            const mockSubscription = createMockSubscription({
                cancelAtPeriodEnd: false,
            });

            const result = mapper.mapSubscriptionToSubRecord(mockSubscription, {
                isActive: false,
            });

            // For inactive subscriptions, validUntil should be around now
            const now = new Date();
            expect(result[0].validUntil.getTime()).toBeCloseTo(
                now.getTime(),
                -4 // within 10 seconds
            );
        });
    });
});

// Test helpers

interface MockSubscriptionData {
    id: string;
    cancel_at_period_end: boolean;
    cancel_at: number | null;
    items?: {
        data: Array<{
            current_period_end: number;
        }>;
    };
}

interface MockCheckoutOptions {
    mode: "payment" | "subscription";
    priceType: "recurring" | "one_time";
    subscription?: MockSubscriptionData | null;
}

function createMockCheckoutSession(options: MockCheckoutOptions) {
    const defaultCancelAt = Math.floor(Date.now() / 1000) + 86400 * 30; // 30 days from now
    const defaultCurrentPeriodEnd = Math.floor(Date.now() / 1000) + 86400 * 365; // 1 year from now

    // If subscription is explicitly set (including null), use that value
    // Otherwise, for subscription mode create a default subscription object
    let subscription: MockSubscriptionData | null;
    if (options.subscription !== undefined) {
        subscription = options.subscription;
    } else if (
        options.mode === "subscription" ||
        options.priceType === "recurring"
    ) {
        subscription = {
            id: "sub_123",
            cancel_at_period_end: true,
            cancel_at: defaultCancelAt,
            items: {
                data: [
                    {
                        current_period_end: defaultCurrentPeriodEnd,
                    },
                ],
            },
        };
    } else {
        // One-time payments have no subscription
        subscription = null;
    }

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
        subscription,
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
    currentPeriodEnd?: number;
    productMetadata?: Record<string, string>;
    customerEmail?: string;
}

function createMockSubscription(options: MockSubscriptionOptions) {
    const defaultCancelAt = Math.floor(Date.now() / 1000) + 86400 * 30; // 30 days from now
    const defaultCurrentPeriodEnd = Math.floor(Date.now() / 1000) + 86400 * 365; // 1 year from now
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
                    current_period_end:
                        options.currentPeriodEnd ?? defaultCurrentPeriodEnd,
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
