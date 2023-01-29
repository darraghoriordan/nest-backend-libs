/* eslint-disable sonarjs/no-duplicated-branches */
import {Injectable} from "@nestjs/common";
import {
    OnQueueActive,
    OnQueueCompleted,
    OnQueueFailed,
    Process,
    Processor,
} from "@nestjs/bull";
import {Job} from "bull";
import CoreLoggerService from "../../logger/CoreLoggerService";
import Stripe from "stripe";

@Injectable()
@Processor("stripe-events")
// This should be provided manually to give the consumer ability to change logic
// it is not part of this modules provided/exported services
// eslint-disable-next-line @darraghor/nestjs-typed/injectable-should-be-provided
export class StripeEventHandler {
    constructor(private readonly logger: CoreLoggerService) {}
    @OnQueueFailed()
    onError(job: Job<Stripe.Event>, error: any) {
        this.logger.error(
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions, @typescript-eslint/no-unnecessary-type-assertion, @typescript-eslint/no-unsafe-member-access
            `Failed job ${job.id} of type ${job.name}: ${error.message as any}`,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            error.stack
        );
    }

    @OnQueueActive()
    // eslint-disable-next-line sonarjs/no-identical-functions
    onActive(job: Job<Stripe.Event>) {
        this.logger.log(`Active job ${job.id} of type ${job.name}`, job.data);
    }

    @OnQueueCompleted()
    // eslint-disable-next-line sonarjs/no-identical-functions
    onComplete(job: Job<Stripe.Event>) {
        this.logger.log(
            `Completed job ${job.id} of type ${job.name}`,
            job.data
        );
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    @Process()
    public async handleEvent(job: Job<Stripe.Event>): Promise<void> {
        const data = job.data.data;
        const eventType = job.data.type;

        this.logger.log("Handling queued item", {
            eventType,
            stripeSessionId: job.data.id,
        });
        // see - https://stripe.com/docs/billing/subscriptions/webhooks
        switch (eventType) {
            case "checkout.session.completed": {
                // Payment is successful and the subscription is created.
                // You should provision the subscription and save the customer ID to your database.

                // e.g. set the billing status as paid until the next billing cycle + 1 or 2 days for grace period
                // also called for payment links! - see https://stripe.com/docs/payments/checkout/fulfill-orders
                return;
            }
            case "checkout.session.async_payment_succeeded": {
                // Payment link payment is successful for async payment methods. (bank drafts, etc.)
                return;
            }
            case "checkout.session.async_payment_failed": {
                // Payment link payment is NOT successful for async payment methods. (bank drafts, etc.)
                return;
            }
            case "invoice.paid": {
                // Continue to provision the subscription as payments continue to be made.
                // Store the status in your database and check when a user accesses your service.
                // This approach helps you avoid hitting rate limits.

                // e.g. set the billing status as paid until the next billing cycle + 1 or 2 days for grace period
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
                return;
            }
            case "customer.subscription.updated": {
                /**
                 * 	Sent when the subscription is successfully started, after the payment is confirmed.
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
                    data,
                });
            }
        }
    }
}
