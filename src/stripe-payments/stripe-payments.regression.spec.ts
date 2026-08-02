import {describe, expect, it, vi} from "vitest";

vi.mock("../organisation/entities/organisation.entity.js", () => ({
    Organisation: class Organisation {},
}));
vi.mock(
    "../organisation-subscriptions/entities/organisation-subscription.entity.js",
    () => ({
        OrganisationSubscriptionRecord: class OrganisationSubscriptionRecord {},
    })
);
vi.mock("./entities/stripe-payment-state.entity.js", () => ({
    StripePaymentState: class StripePaymentState {},
}));
vi.mock("./entities/stripe-payment-event.entity.js", () => ({
    StripeCheckoutEvent: class StripeCheckoutEvent {},
}));

import {Organisation} from "../organisation/entities/organisation.entity.js";
import {OrganisationSubscriptionRecord} from "../organisation-subscriptions/entities/organisation-subscription.entity.js";
import {SecureStripeEventsController} from "./controllers/secure-stripe-events.controller.js";
import {StripePaymentState} from "./entities/stripe-payment-state.entity.js";
import {
    SecureSubscriptionInput,
    SecureSubscriptionService,
} from "./services/secure-subscription.service.js";
import {StripePaymentEventProcessor} from "./services/stripe-payment-event.processor.js";
import {StripePaymentsTelemetryService} from "./services/stripe-payments-telemetry.service.js";

describe("Stripe payments regressions", () => {
    it("requires admin claims on both event handlers", () => {
        expect(
            Reflect.getMetadata(
                "mandatoryUserClaims",
                SecureStripeEventsController.prototype.getEvents
            )
        ).toEqual(["read:all"]);
        expect(
            Reflect.getMetadata(
                "mandatoryUserClaims",
                SecureStripeEventsController.prototype.replay
            )
        ).toEqual(["read:all"]);
    });

    it("persists a first payment and its ordering state atomically", async () => {
        const organisation = {uuid: "organisation-uuid"};
        const subscriptionRepository = {
            findOne: vi.fn().mockResolvedValue(null),
            create: vi.fn().mockReturnValue({organisation}),
            save: vi
                .fn()
                .mockImplementation((record) =>
                    Promise.resolve({...record, uuid: "subscription-uuid"})
                ),
        };
        const stateRepository = {
            findOne: vi.fn().mockResolvedValue(null),
            create: vi.fn().mockImplementation((state) => ({...state})),
            save: vi.fn().mockResolvedValue(undefined),
        };
        const manager = {
            query: vi.fn().mockResolvedValue(undefined),
            getRepository: vi.fn().mockImplementation((entity) => {
                if (entity === OrganisationSubscriptionRecord) {
                    return subscriptionRepository;
                }
                if (entity === StripePaymentState) {
                    return stateRepository;
                }
                if (entity === Organisation) {
                    return {
                        findOne: vi.fn().mockResolvedValue(organisation),
                    };
                }
                throw new Error("Unexpected repository");
            }),
        };
        const rootRepository = {
            manager: {
                transaction: vi
                    .fn()
                    .mockImplementation((callback) => callback(manager)),
            },
        };
        const activationQueue = {add: vi.fn().mockResolvedValue(undefined)};
        const service = new SecureSubscriptionService(
            rootRepository as never,
            activationQueue as never
        );
        const validUntil = new Date("2027-01-01T00:00:00.000Z");
        const input: SecureSubscriptionInput = {
            paymentSystemTransactionId: "sub_123",
            paymentSystemProductId: "prod_123",
            paymentSystemCustomerId: "cus_123",
            paymentSystemCustomerEmail: "customer@example.com",
            paymentSystemMode: "subscription",
            paymentSystemName: "stripe",
            validUntil,
            internalSku: "starter",
            productDisplayName: "Starter",
            organisationUuid: organisation.uuid,
            stripeEventId: "evt_123",
            stripeEventCreatedAt: new Date("2026-08-02T00:00:00.000Z"),
            stripeStatus: "active",
        };

        const result = await service.save(input);

        expect(result.validUntil).toBe(validUntil);
        expect(manager.query).toHaveBeenCalledWith(
            "SELECT pg_advisory_xact_lock(hashtext($1))",
            ["sub_123"]
        );
        expect(stateRepository.save).toHaveBeenCalledOnce();
        expect(activationQueue.add).toHaveBeenCalledOnce();
    });

    it("retries a busy event instead of acknowledging it", async () => {
        const eventService = {
            claim: vi.fn().mockResolvedValue(false),
            isProcessed: vi.fn().mockResolvedValue(false),
        };
        const fulfillmentService = {process: vi.fn()};
        const telemetry = {record: vi.fn()};
        const processor = new StripePaymentEventProcessor(
            eventService as never,
            fulfillmentService as never,
            telemetry as never
        );

        await expect(
            processor.process({data: {id: "evt_123"}} as never)
        ).rejects.toThrow("currently claimed");
        expect(fulfillmentService.process).not.toHaveBeenCalled();
    });

    it("does not let an application telemetry failure break payments", async () => {
        const service = new StripePaymentsTelemetryService({
            record: vi.fn().mockRejectedValue(new Error("metrics unavailable")),
        });

        await expect(
            service.record({
                name: "webhook.processed",
                stripeEventId: "evt_123",
                eventType: "checkout.session.completed",
            })
        ).resolves.toBeUndefined();
    });
});
