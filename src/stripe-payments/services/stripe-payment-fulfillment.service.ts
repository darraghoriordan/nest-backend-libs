import {Inject, Injectable, Logger} from "@nestjs/common";
import Stripe from "stripe";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {StripeCheckoutAttempt} from "../entities/stripe-checkout-attempt.entity.js";
import {PaymentSessionService} from "../../payment-sessions/payment-session.service.js";
import {SecureStripeProductService} from "./secure-stripe-product.service.js";
import {
    STRIPE_PAYMENTS_ENTITLEMENT_STORE,
    StripePaymentsEntitlementInput,
    StripePaymentsEntitlementStore,
} from "../stripe-payments.extensions.js";

type StripeMetadata = Partial<Record<string, string>>;

function getMetadata(value: {
    metadata?: StripeMetadata | null;
}): StripeMetadata {
    return value.metadata ?? {};
}

function getCustomer(
    customer: string | Stripe.Customer | Stripe.DeletedCustomer | null
): {id: string; email: string} {
    if (typeof customer === "string") {
        return {id: customer, email: "unknown"};
    }
    if (!customer || "deleted" in customer) {
        return {id: customer?.id ?? "unknown", email: "unknown"};
    }
    return {
        id: customer.id,
        email: customer.email ?? "unknown",
    };
}

function addGracePeriod(date: Date): Date {
    return new Date(date.getTime() + 2 * 24 * 60 * 60 * 1000);
}

function getLifetimeDate(): Date {
    const lifetime = new Date();
    lifetime.setFullYear(lifetime.getFullYear() + 500);
    return lifetime;
}

@Injectable()
export class StripePaymentFulfillmentService {
    private readonly logger = new Logger(StripePaymentFulfillmentService.name);

    constructor(
        @Inject("SecureStripeClient")
        private readonly stripe: Stripe,
        @InjectRepository(StripeCheckoutAttempt)
        private readonly attemptRepository: Repository<StripeCheckoutAttempt>,
        private readonly paymentSessionService: PaymentSessionService,
        private readonly productService: SecureStripeProductService,
        @Inject(STRIPE_PAYMENTS_ENTITLEMENT_STORE)
        private readonly entitlementStore: StripePaymentsEntitlementStore
    ) {}

    async process(event: Stripe.Event): Promise<void> {
        switch (event.type) {
            case "checkout.session.completed":
                await this.processCheckoutSession(event, false);
                return;
            case "checkout.session.async_payment_succeeded":
                await this.processCheckoutSession(event, true);
                return;
            case "checkout.session.async_payment_failed":
            case "checkout.session.expired":
                await this.markCheckoutAttemptFailed(event);
                return;
            case "customer.subscription.created":
            case "customer.subscription.updated":
            case "customer.subscription.deleted":
            case "customer.subscription.paused":
            case "customer.subscription.resumed":
                await this.processSubscriptionEvent(event);
                return;
            case "invoice.paid":
            case "invoice.payment_failed":
                await this.processInvoiceEvent(event);
                return;
            case "charge.refunded":
                await this.processRefundEvent(event);
                return;
            case "charge.dispute.created":
                await this.processDisputeEvent(event);
                return;
            default:
                return;
        }
    }

    private async processCheckoutSession(
        event: Stripe.Event,
        isAsyncPayment: boolean
    ): Promise<void> {
        const sessionEvent = event.data.object as Stripe.Checkout.Session;
        const session = await this.stripe.checkout.sessions.retrieve(
            sessionEvent.id,
            {
                expand: [
                    "line_items.data.price.product",
                    "customer",
                    "subscription",
                ],
            }
        );

        if (!isAsyncPayment && session.payment_status !== "paid") {
            return;
        }

        const lineItems = session.line_items?.data ?? [];
        if (lineItems.length !== 1 || lineItems[0]?.quantity !== 1) {
            throw new Error(
                "Checkout session did not contain the expected product"
            );
        }
        const lineItem = lineItems[0];
        const price = lineItem.price;
        if (!price || typeof price === "string") {
            throw new Error("Checkout session price was not expanded");
        }
        const configuredProduct = this.productService.getByPriceId(price.id);
        const metadata = getMetadata(session);
        if (
            metadata.productKey &&
            metadata.productKey !== configuredProduct.key
        ) {
            throw new Error(
                "Checkout metadata did not match the configured product"
            );
        }

        const organisationUuid = await this.resolveOrganisationUuid(
            session,
            metadata
        );
        const customer = getCustomer(session.customer);
        const subscriptionId = this.getSubscriptionId(session.subscription);
        let validUntil = getLifetimeDate();
        if (configuredProduct.mode === "subscription") {
            if (!subscriptionId) {
                throw new Error(
                    "Subscription checkout did not create a subscription"
                );
            }
            const subscription =
                await this.retrieveSubscription(subscriptionId);
            validUntil = this.getSubscriptionValidUntil(subscription);
        }

        const productObject =
            typeof price.product === "string" ? undefined : price.product;
        const input: StripePaymentsEntitlementInput = {
            paymentSystemTransactionId: subscriptionId ?? session.id,
            paymentSystemProductId: productObject?.id ?? price.id,
            paymentSystemCustomerId: customer.id,
            paymentSystemCustomerEmail:
                customer.email !== "unknown"
                    ? customer.email
                    : (session.customer_details?.email ?? "unknown"),
            paymentSystemMode: configuredProduct.mode,
            paymentSystemName: "stripe",
            validUntil,
            internalSku: configuredProduct.internalSku,
            productDisplayName:
                productObject && !("deleted" in productObject)
                    ? productObject.name
                    : configuredProduct.displayName,
            organisationUuid,
            stripeEventId: event.id,
            stripeEventCreatedAt: this.eventCreatedAt(event),
            stripeStatus:
                configuredProduct.mode === "subscription" ? "active" : "paid",
        };
        await this.entitlementStore.save(input);
    }

    private async markCheckoutAttemptFailed(
        event: Stripe.Event
    ): Promise<void> {
        const session = event.data.object as Stripe.Checkout.Session;
        await this.attemptRepository.update(
            {stripeSessionId: session.id},
            {
                status: "failed",
                errorMessage:
                    event.type === "checkout.session.expired"
                        ? "Checkout session expired"
                        : "Asynchronous payment failed",
            }
        );
        this.logger.warn("Stripe Checkout attempt did not complete", {
            eventId: event.id,
            sessionId: session.id,
            eventType: event.type,
        });
    }

    private async processSubscriptionEvent(event: Stripe.Event): Promise<void> {
        const subscriptionEvent = event.data.object as Stripe.Subscription;
        const subscription = await this.retrieveSubscription(
            subscriptionEvent.id
        );
        await this.saveSubscription(subscription, event);
    }

    private async processInvoiceEvent(event: Stripe.Event): Promise<void> {
        const invoice = event.data.object as Stripe.Invoice;
        const parent = invoice.parent as {
            type?: string;
            subscription?: string | Stripe.Subscription;
        } | null;
        const subscriptionId =
            parent?.type === "subscription_details"
                ? this.getSubscriptionId(parent.subscription)
                : undefined;
        if (!subscriptionId) {
            return;
        }
        const subscription = await this.retrieveSubscription(subscriptionId);
        await this.saveSubscription(subscription, event);
    }

    private async processRefundEvent(event: Stripe.Event): Promise<void> {
        const charge = event.data.object as Stripe.Charge;
        await this.revokeChargeEntitlement(charge, event, "refunded");
    }

    private async processDisputeEvent(event: Stripe.Event): Promise<void> {
        const dispute = event.data.object as Stripe.Dispute;
        const chargeId = this.getId(dispute.charge);
        if (!chargeId) {
            return;
        }
        const charge = await this.stripe.charges.retrieve(chargeId);
        await this.revokeChargeEntitlement(charge, event, "disputed");
    }

    private async revokeChargeEntitlement(
        charge: Stripe.Charge,
        event: Stripe.Event,
        status: "refunded" | "disputed"
    ): Promise<void> {
        const input = {
            stripeEventId: event.id,
            stripeEventCreatedAt: this.eventCreatedAt(event),
            stripeStatus: status,
        } as const;
        const paymentIntentId = this.getId(charge.payment_intent);
        if (paymentIntentId) {
            const paymentIntent =
                await this.stripe.paymentIntents.retrieve(paymentIntentId);
            const paymentIntentMetadata = paymentIntent.metadata as Partial<
                Record<string, string>
            >;
            const checkoutAttemptId = paymentIntentMetadata.checkoutAttemptId;
            if (/^\d+$/.test(checkoutAttemptId ?? "")) {
                const attempt = await this.attemptRepository.findOne({
                    where: {id: Number(checkoutAttemptId)},
                });
                if (attempt?.stripeSessionId) {
                    const revoked = await this.entitlementStore.revokePayment(
                        attempt.stripeSessionId,
                        input
                    );
                    if (revoked) {
                        return;
                    }
                }
            }
        }

        const customerId = getCustomer(charge.customer).id;
        if (customerId !== "unknown") {
            await this.entitlementStore.revokeCustomerPayments(
                customerId,
                input
            );
        }
    }

    private async saveSubscription(
        subscription: Stripe.Subscription,
        event: Stripe.Event
    ): Promise<void> {
        if (subscription.items.data.length === 0) {
            throw new Error("Subscription has no line items");
        }
        const firstItem = subscription.items.data[0];
        const price = firstItem.price;
        if (typeof price === "string") {
            throw new Error("Subscription price was not expanded");
        }
        const configuredProduct = this.productService.getByPriceId(price.id);
        const metadata = getMetadata(subscription);
        const existing = await this.entitlementStore.findByTransactionId(
            subscription.id
        );
        const organisationUuid =
            metadata.organisationUuid ?? existing?.organisationUuid;
        if (!organisationUuid) {
            throw new Error(
                "Subscription event could not be matched to an organisation"
            );
        }
        const customer = getCustomer(subscription.customer);
        const productObject =
            typeof price.product === "string" ? undefined : price.product;
        const status =
            event.type === "customer.subscription.deleted"
                ? "canceled"
                : subscription.status;
        await this.entitlementStore.save({
            paymentSystemTransactionId: subscription.id,
            paymentSystemProductId: productObject?.id ?? price.id,
            paymentSystemCustomerId: customer.id,
            paymentSystemCustomerEmail: customer.email,
            paymentSystemMode: "subscription",
            paymentSystemName: "stripe",
            validUntil: this.getSubscriptionValidUntil(subscription, status),
            internalSku: configuredProduct.internalSku,
            productDisplayName:
                productObject && !("deleted" in productObject)
                    ? productObject.name
                    : configuredProduct.displayName,
            organisationUuid,
            stripeEventId: event.id,
            stripeEventCreatedAt: this.eventCreatedAt(event),
            stripeStatus: status,
        });
    }

    private async resolveOrganisationUuid(
        session: Stripe.Checkout.Session,
        metadata: StripeMetadata
    ): Promise<string> {
        if (metadata.organisationUuid) {
            return metadata.organisationUuid;
        }
        const attempt = await this.attemptRepository.findOne({
            where: {stripeSessionId: session.id},
        });
        if (attempt) {
            return attempt.organisationUuid;
        }

        // Preserve compatibility with sessions created by the legacy shared
        // Stripe module, which used a PaymentSessionReference UUID as the
        // Checkout client_reference_id.
        const referenceId = this.getClientReferenceId(session);
        if (referenceId) {
            const paymentReference =
                await this.paymentSessionService.findSessionByUuid(referenceId);
            if (paymentReference?.organisationUuid) {
                return paymentReference.organisationUuid;
            }
        }

        throw new Error(
            "Checkout session could not be matched to an organisation"
        );
    }

    private async retrieveSubscription(
        id: string
    ): Promise<Stripe.Subscription> {
        return this.stripe.subscriptions.retrieve(id, {
            expand: ["items.data.price.product", "customer"],
        });
    }

    private getSubscriptionValidUntil(
        subscription: Stripe.Subscription,
        status = subscription.status
    ): Date {
        if (
            status === "canceled" ||
            status === "unpaid" ||
            status === "incomplete_expired" ||
            status === "paused"
        ) {
            return new Date();
        }
        const periodEnd = subscription.items.data[0]?.current_period_end;
        if (!periodEnd) {
            throw new Error("Stripe subscription has no current period end");
        }
        return addGracePeriod(new Date(periodEnd * 1000));
    }

    private getSubscriptionId(
        subscription: string | Stripe.Subscription | null | undefined
    ): string | undefined {
        return typeof subscription === "string"
            ? subscription
            : subscription?.id;
    }

    private getId(
        value: string | {id: string} | null | undefined
    ): string | undefined {
        return typeof value === "string" ? value : value?.id;
    }

    private getClientReferenceId(
        session: Stripe.Checkout.Session
    ): string | undefined {
        return typeof session.client_reference_id === "string"
            ? session.client_reference_id
            : undefined;
    }

    private eventCreatedAt(event: Stripe.Event): Date {
        return new Date(event.created * 1000);
    }
}
