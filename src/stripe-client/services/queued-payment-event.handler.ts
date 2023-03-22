/* eslint-disable sonarjs/no-duplicate-string */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable sonarjs/no-duplicated-branches */
import {Inject, Injectable, Logger} from "@nestjs/common";
import {
    OnQueueActive,
    OnQueueCompleted,
    OnQueueFailed,
    Process,
    Processor,
} from "@nestjs/bull";
import {Job} from "bull";
import Stripe from "stripe";
import {SaveOrganisationSubscriptionRecordDto} from "../../organisation-subscriptions/models/fulfillSubscriptionDto.js";
import {InjectRepository} from "@nestjs/typeorm";
import {StripeCheckoutEvent} from "../entities/stripe-checkout-event.entity.js";
import {Repository} from "typeorm";
import {OrganisationSubscriptionService} from "../../organisation-subscriptions/organisation-subscriptions.service.js";

@Injectable()
@Processor("stripe-events")
// This is just a looong example with notes. You should create your own handler
// with this as a reference
// You likely only need to handle the "checkout.session.completed" event for purchases
// and the "customer.subscription.updated" event for subscription updates
// https://stripe.com/docs/billing/subscriptions/webhooks

// eslint-disable-next-line @darraghor/nestjs-typed/injectable-should-be-provided
export class StripeQueuedEventHandler {
    private readonly logger = new Logger(StripeQueuedEventHandler.name);
    constructor(
        @Inject("StripeClient")
        private readonly stripe: Stripe,
        @InjectRepository(StripeCheckoutEvent)
        private readonly stripeCheckoutEventRepository: Repository<StripeCheckoutEvent>,
        private readonly organisationSubscriptionService: OrganisationSubscriptionService
    ) {}
    @OnQueueFailed()
    onError(job: Job<Stripe.Event>, error: Error) {
        this.logger.error(
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions, @typescript-eslint/no-unnecessary-type-assertion, @typescript-eslint/no-unsafe-member-access
            `Failed job ${job.id} of type ${job.name}: ${error.message as any}`,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            {errorStack: error}
        );
    }

    @OnQueueActive()
    // eslint-disable-next-line sonarjs/no-identical-functions
    onActive(job: Job<Stripe.Event>) {
        this.logger.log(`Active job ${job.id} of type ${job.name}`);
    }

    @OnQueueCompleted()
    // eslint-disable-next-line sonarjs/no-identical-functions
    onComplete(job: Job<Stripe.Event>) {
        this.logger.log(`Completed job ${job.id} of type ${job.name}`);
    }

    public mapCheckoutSessionToSubFulfilment(
        fullSession: Stripe.Response<Stripe.Checkout.Session>
    ): SaveOrganisationSubscriptionRecordDto[] {
        // for subscription products use stripes subscription end date
        // for one-off products use today + 100 years
        const subs = [];

        for (const lineItem of fullSession.line_items!.data) {
            const subscriptionFulfilmentDto = this.createFulfilmentDto(
                lineItem.price?.product,
                fullSession.customer,
                fullSession.customer_email,
                fullSession.customer_details?.email
            );

            subscriptionFulfilmentDto.paymentSystemMode = this.mapPaymentType(
                lineItem.price?.type,
                fullSession.mode
            );
            subscriptionFulfilmentDto.validUntil = this.mapNewValidUntil(
                subscriptionFulfilmentDto.paymentSystemMode,
                true,
                (fullSession.subscription! as Stripe.Subscription)
                    ?.current_period_end
            );

            subscriptionFulfilmentDto.paymentSystemTransactionId =
                fullSession.mode === "subscription" ||
                lineItem.price?.type === "recurring"
                    ? (fullSession.subscription! as Stripe.Subscription)?.id
                    : fullSession.id;

            subscriptionFulfilmentDto.millerPaymentReferenceUuid =
                fullSession.client_reference_id ?? undefined;

            subs.push(subscriptionFulfilmentDto);
        }
        return subs;
    }
    private createFulfilmentDto(
        product?: unknown,
        customer?: unknown,
        altEmail?: string | null,
        altEmail2?: string | null
    ): SaveOrganisationSubscriptionRecordDto {
        const subscriptionFulfilmentDto: SaveOrganisationSubscriptionRecordDto =
            new SaveOrganisationSubscriptionRecordDto();

        subscriptionFulfilmentDto.paymentSystemName = "stripe";

        subscriptionFulfilmentDto.paymentSystemProductId = (
            product as Stripe.Product
        )?.id;

        subscriptionFulfilmentDto.productDisplayName = (
            product as Stripe.Product
        ).name;

        subscriptionFulfilmentDto.paymentSystemCustomerId =
            (customer as Stripe.Customer)?.id || "unknown";

        subscriptionFulfilmentDto.paymentSystemCustomerEmail =
            (customer as Stripe.Customer)?.email ||
            altEmail ||
            altEmail2 ||
            "unknown";

        return subscriptionFulfilmentDto;
    }
    public mapInvoiceToSubFulfilment(
        fullInvoice: Stripe.Response<Stripe.Invoice>
    ): SaveOrganisationSubscriptionRecordDto[] {
        // for subscription products use stripes subscription end date
        // for one-off products use today + 100 years

        const subs = [];
        for (const lineItem of fullInvoice.lines.data) {
            const subscriptionFulfilmentDto = this.createFulfilmentDto(
                lineItem.price?.product,
                fullInvoice.customer,
                fullInvoice.customer_email
            );

            const fullSubscription =
                fullInvoice.subscription! as Stripe.Subscription;

            subscriptionFulfilmentDto.paymentSystemMode = this.mapPaymentType(
                lineItem.price?.type
            );
            subscriptionFulfilmentDto.validUntil = this.mapNewValidUntil(
                subscriptionFulfilmentDto.paymentSystemMode,
                fullSubscription.status === "active" ||
                    fullSubscription.status === "trialing",
                fullSubscription.current_period_end
            );

            subscriptionFulfilmentDto.paymentSystemTransactionId =
                lineItem.price?.type === "recurring"
                    ? fullSubscription.id
                    : fullInvoice.id;

            subs.push(subscriptionFulfilmentDto);
        }
        return subs;
    }

    private mapPaymentType(
        type?: string,
        sessionMode?: string
    ): "subscription" | "payment" {
        if (type === "recurring" || sessionMode === "subscription") {
            return "subscription";
        }
        return "payment";
    }
    private mapNewValidUntil(
        paymentSystemMode: string,
        isActive: boolean,
        stripeCurrentPeriodEnd?: number
    ) {
        let newValidUntil: Date = new Date();

        if (paymentSystemMode === "payment") {
            // the valid until is basically the end of time
            const todayPlus100 = new Date();
            todayPlus100.setFullYear(todayPlus100.getFullYear() + 500);
            newValidUntil = todayPlus100;
        }

        // otherwise it's a subscription
        if (paymentSystemMode === "subscription" && isActive) {
            if (!stripeCurrentPeriodEnd) {
                throw new Error("stripeCurrentPeriodEnd is not set");
            }
            const twoDaysInMilliSeconds = 2 * 24 * 60 * 60 * 1000;
            const stripeCurrentPeriodEndMilliSeconds =
                stripeCurrentPeriodEnd * 1000;
            newValidUntil = new Date(
                stripeCurrentPeriodEndMilliSeconds + twoDaysInMilliSeconds
            );
            this.logger.log(
                `Set valid until to ${newValidUntil.toISOString()} based on sub ${stripeCurrentPeriodEnd}`
            );
        }

        return newValidUntil;
    }

    public mapSubscriptionToSubFulfilment(
        fullSubscription: Stripe.Response<Stripe.Subscription>,
        additionalMeta: {
            isActive: boolean;
        }
    ): SaveOrganisationSubscriptionRecordDto[] {
        // for subscription products use stripes subscription end date
        // for one-off products use today + 100 years
        const subs = [];
        for (const lineItem of fullSubscription.items.data) {
            const subscriptionFulfilmentDto = this.createFulfilmentDto(
                lineItem.price?.product,
                fullSubscription.customer
            );

            subscriptionFulfilmentDto.paymentSystemMode = "subscription";
            subscriptionFulfilmentDto.paymentSystemTransactionId =
                fullSubscription.id;

            subscriptionFulfilmentDto.validUntil = this.mapNewValidUntil(
                subscriptionFulfilmentDto.paymentSystemMode,
                additionalMeta.isActive,
                fullSubscription.current_period_end
            );

            subs.push(subscriptionFulfilmentDto);
        }
        return subs;
    }
    // eslint-disable-next-line @typescript-eslint/require-await
    @Process()
    public async handleEvent(job: Job<Stripe.Event>): Promise<void> {
        const eventType = job.data.type;

        this.logger.log("Handling queued item", {
            eventType,
        });
        try {
            const eventToStore = this.stripeCheckoutEventRepository.create();
            eventToStore.stripeObjectType = eventType || "unknown";
            eventToStore.clientReferenceId = "not set";

            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            eventToStore.stripeSessionId =
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                (job?.data?.data?.object as any)?.id || "unknown";
            eventToStore.stripeData = job.data;

            await this.stripeCheckoutEventRepository.save(eventToStore);
        } catch (error) {
            this.logger.error("Error saving Stripe event", error);
        }
        // see - https://stripe.com/docs/billing/subscriptions/webhooks
        switch (eventType) {
            case "checkout.session.completed": {
                // Payment is successful and for example the subscription can be created.
                // If you support asynchronous payment methods, handle those events in the
                // checkout.session.async_payment_succeeded webhook.
                const stripeDataProperty = job.data.data
                    .object as Stripe.Checkout.Session;
                if (stripeDataProperty.payment_status === "paid") {
                    // fulfil it
                    const fullSession =
                        await this.stripe.checkout.sessions.retrieve(
                            stripeDataProperty.id,
                            {
                                expand: [
                                    "line_items.data.price.product",
                                    "customer",
                                    "subscription",
                                ],
                            }
                        );
                    const subs =
                        this.mapCheckoutSessionToSubFulfilment(fullSession);

                    const result =
                        await this.organisationSubscriptionService.save(subs);
                    this.logger.log("Synchronous payment succeeded", {result});
                }

                return;
            }
            case "checkout.session.async_payment_succeeded": {
                // Payment link payment is successful for async payment methods. (bank drafts, etc.)
                const stripeDataProperty = job.data.data
                    .object as Stripe.Checkout.Session;
                const fullSession =
                    await this.stripe.checkout.sessions.retrieve(
                        stripeDataProperty.id,
                        {
                            expand: [
                                "line_items.data.price.product",
                                "customer",
                                "subscription",
                            ],
                        }
                    );
                const subs =
                    this.mapCheckoutSessionToSubFulfilment(fullSession);

                const result = await this.organisationSubscriptionService.save(
                    subs
                );
                this.logger.log("Async payment succeeded", {result});
                return;
            }
            case "checkout.session.async_payment_failed": {
                // Payment link payment is NOT successful for async payment methods. (bank drafts, etc.)
                // You can use this webhook to notify the user that their payment was not successful.
                const stripeDataProperty = job.data.data
                    .object as Stripe.Checkout.Session;
                this.logger.error(
                    `Async payment failed for session ${stripeDataProperty.id}`
                );
                return;
            }
            case "charge.succeeded": {
                // Payment is successful.
                // These are triggered but you can use the checkout.session.completed event instead

                return;
            }
            case "payment_intent.succeeded": {
                // These are triggered but you can use the checkout.session.completed event instead
                return;
            }
            case "payment_intent.created": {
                // These are triggered but you can use the checkout.session.completed event instead
                return;
            }

            case "invoice.paid": {
                // Continue to provision the subscription as payments continue to be made.
                // Store the status in your database and check when a user accesses your service.
                // This approach helps you avoid hitting rate limits.
                const stripeDataProperty = job.data.data
                    .object as Stripe.Invoice;
                const fullInvoice = await this.stripe.invoices.retrieve(
                    stripeDataProperty.id,
                    {
                        expand: [
                            "lines.data.price.product",
                            "customer",
                            "subscription",
                        ],
                    }
                );
                const subs = this.mapInvoiceToSubFulfilment(fullInvoice);

                const result = await this.organisationSubscriptionService.save(
                    subs
                );
                this.logger.log("Invoiced payment succeeded", {result});

                return;
            }
            case "customer.subscription.trial_will_end": {
                // Send notification to the user that the trial will end
                return;
            }

            case "invoice.payment_failed": {
                // The payment failed or the customer does not have a valid payment method.

                // The subscription becomes past_due. Notify your customer and send them to the
                // customer portal to update their payment information.
                const stripeDataProperty = job.data.data
                    .object as Stripe.Invoice;
                this.logger.error("Invoice payment failed", {
                    stripeDataProperty,
                });

                return;
            }
            case "customer.subscription.created": {
                /*
                Sent when the subscription is created.
                The subscription status may be incomplete if customer
                authentication is required to complete the payment
                or if you set payment_behavior to default_incomplete.
                For more details, read about subscription payment behavior.
                */
                return;
            }
            case "customer.subscription.deleted": {
                // 	Sent when a customer’s subscription ends.
                const stripeDataProperty = job.data.data
                    .object as Stripe.Subscription;
                const fullSession = await this.stripe.subscriptions.retrieve(
                    stripeDataProperty.id,
                    {
                        expand: ["items.data.price.product", "customer"],
                    }
                );
                const subs = this.mapSubscriptionToSubFulfilment(fullSession, {
                    isActive: false,
                });
                for (const sub of subs) {
                    sub.validUntil = new Date();
                }

                const result = await this.organisationSubscriptionService.save(
                    subs
                );
                this.logger.log(
                    "Subscription deleted - validity set to today",
                    {result}
                );

                return;
            }
            case "customer.subscription.updated": {
                /**
                 * Sent when the subscription is successfully started, after the payment is confirmed.
                 * Also sent whenever a subscription is changed.
                 * For example, adding a coupon, applying a discount,
                 * adding an invoice item, and changing plans all trigger this event.
                 */
                const stripeDataProperty = job.data.data
                    .object as Stripe.Subscription;
                const fullSubscription =
                    await this.stripe.subscriptions.retrieve(
                        stripeDataProperty.id,
                        {
                            expand: ["items.data.price.product", "customer"],
                        }
                    );
                const subs = this.mapSubscriptionToSubFulfilment(
                    fullSubscription,
                    {
                        isActive:
                            fullSubscription.status === "active" ||
                            fullSubscription.status === "trialing",
                    }
                );

                const result = await this.organisationSubscriptionService.save(
                    subs
                );

                this.logger.log("Subscription updated", {result});
                return;
            }

            default: {
                this.logger.warn(`Stripe webhook unknown event type`, {
                    eventType,
                    event: job.data,
                    data: job.data.data,
                });
            }
        }
    }
}
