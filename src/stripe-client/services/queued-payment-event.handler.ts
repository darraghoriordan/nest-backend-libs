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
import {OrganisationSubscriptionService} from "../../organisation-subscriptions";
import {SaveOrganisationSubscriptionRecordDto} from "../../organisation-subscriptions/models/fulfillSubscriptionDto";

@Injectable()
@Processor("stripe-events")
// This is just an example with notes. You should create your own handler
//
// eslint-disable-next-line @darraghor/nestjs-typed/injectable-should-be-provided
export class StripeQueuedEventHandler {
    private readonly logger = new Logger(StripeQueuedEventHandler.name);
    constructor(
        @Inject("StripeClient")
        private readonly stripe: Stripe,
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
            const subscriptionFulfilmentDto: SaveOrganisationSubscriptionRecordDto =
                new SaveOrganisationSubscriptionRecordDto();
            let newValidUntil: Date = new Date();
            if (
                fullSession.mode === "subscription" ||
                lineItem.price?.type === "recurring"
            ) {
                const twoDaysInMilliSeconds = 2 * 24 * 60 * 60 * 1000;
                newValidUntil = new Date(
                    //prettier-ignore
                    (fullSession.subscription! as Stripe.Subscription).current_period_end
                + twoDaysInMilliSeconds
                );
                subscriptionFulfilmentDto.paymentSystemMode = "subscription";
                subscriptionFulfilmentDto.paymentSystemTransactionId = (
                    fullSession.subscription! as Stripe.Subscription
                ).id;
            } else {
                const todayPlus100 = new Date();
                todayPlus100.setFullYear(todayPlus100.getFullYear() + 100);
                newValidUntil = todayPlus100;
                subscriptionFulfilmentDto.paymentSystemMode = "payment";
                subscriptionFulfilmentDto.paymentSystemTransactionId =
                    fullSession.id;
            }
            subscriptionFulfilmentDto.validUntil = newValidUntil;
            subscriptionFulfilmentDto.millerPaymentReferenceUuid =
                fullSession.client_reference_id ?? undefined;

            subscriptionFulfilmentDto.paymentSystemCustomerId =
                (fullSession.customer as Stripe.Customer)?.id || "unknown";

            subscriptionFulfilmentDto.paymentSystemName = "stripe";
            subscriptionFulfilmentDto.paymentSystemProductId = (
                lineItem.price?.product as Stripe.Product
            )?.id;

            subscriptionFulfilmentDto.productDisplayName = (
                lineItem.price?.product as Stripe.Product
            ).name;

            subs.push(subscriptionFulfilmentDto);
        }
        return subs;
    }

    public mapInvoiceToSubFulfilment(
        fullInvoice: Stripe.Response<Stripe.Invoice>
    ): SaveOrganisationSubscriptionRecordDto[] {
        // for subscription products use stripes subscription end date
        // for one-off products use today + 100 years

        const subs = [];
        for (const lineItem of fullInvoice.lines.data) {
            const subscriptionFulfilmentDto: SaveOrganisationSubscriptionRecordDto =
                new SaveOrganisationSubscriptionRecordDto();
            let newValidUntil: Date = new Date();
            if (lineItem.price?.type === "recurring") {
                const twoDaysInMilliSeconds = 2 * 24 * 60 * 60 * 1000;
                newValidUntil = new Date(
                    //prettier-ignore
                    (fullInvoice.subscription! as Stripe.Subscription).current_period_end
                + twoDaysInMilliSeconds
                );
                subscriptionFulfilmentDto.paymentSystemMode = "subscription";
                subscriptionFulfilmentDto.paymentSystemTransactionId = (
                    fullInvoice.subscription! as Stripe.Subscription
                ).id;
            } else {
                const todayPlus100 = new Date();
                todayPlus100.setFullYear(todayPlus100.getFullYear() + 100);
                newValidUntil = todayPlus100;
                subscriptionFulfilmentDto.paymentSystemMode = "payment";
                subscriptionFulfilmentDto.paymentSystemTransactionId =
                    fullInvoice.id;
            }
            subscriptionFulfilmentDto.validUntil = newValidUntil;

            subscriptionFulfilmentDto.paymentSystemCustomerId =
                (fullInvoice.customer as Stripe.Customer)?.id || "unknown";

            subscriptionFulfilmentDto.paymentSystemName = "stripe";
            subscriptionFulfilmentDto.paymentSystemProductId = (
                lineItem.price?.product as Stripe.Product
            )?.id;

            subscriptionFulfilmentDto.productDisplayName = (
                lineItem.price?.product as Stripe.Product
            ).name;

            subs.push(subscriptionFulfilmentDto);
        }
        return subs;
    }

    public mapSubscriptionToSubFulfilment(
        fullSubscription: Stripe.Response<Stripe.Subscription>
    ): SaveOrganisationSubscriptionRecordDto[] {
        // for subscription products use stripes subscription end date
        // for one-off products use today + 100 years
        const subs = [];
        for (const lineItem of fullSubscription.items.data) {
            const subscriptionFulfilmentDto: SaveOrganisationSubscriptionRecordDto =
                new SaveOrganisationSubscriptionRecordDto();
            let newValidUntil: Date = new Date();

            const twoDaysInMilliSeconds = 2 * 24 * 60 * 60 * 1000;
            newValidUntil = new Date(
                //prettier-ignore
                fullSubscription.current_period_end
                + twoDaysInMilliSeconds
            );
            subscriptionFulfilmentDto.paymentSystemTransactionId =
                fullSubscription.id;

            subscriptionFulfilmentDto.validUntil = newValidUntil;

            subscriptionFulfilmentDto.paymentSystemCustomerId =
                (fullSubscription.customer as Stripe.Customer)?.id || "unknown";
            subscriptionFulfilmentDto.paymentSystemMode = "subscription";
            subscriptionFulfilmentDto.paymentSystemName = "stripe";
            subscriptionFulfilmentDto.paymentSystemProductId = (
                lineItem.price?.product as Stripe.Product
            )?.id;

            subscriptionFulfilmentDto.productDisplayName = (
                lineItem.price?.product as Stripe.Product
            ).name;

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
                    // otherwise we will get a checkout.session.async_payment_succeeded
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
                const subs = this.mapSubscriptionToSubFulfilment(fullSession);
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
