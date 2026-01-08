/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {Injectable, Logger} from "@nestjs/common";
import Stripe from "stripe";
import {SaveOrganisationSubscriptionRecordDto} from "../../organisation-subscriptions/models/fulfillSubscriptionDto.js";

@Injectable()
export default class SubscriptionRecordMapper {
    private readonly logger = new Logger(SubscriptionRecordMapper.name);

    public mapCheckoutSessionToSubRecord(
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

            // For one-time payments, subscription is null - validUntil will be set to ~500 years
            // For subscriptions, use cancel_at if cancellation is scheduled, otherwise use current_period_end from first item
            let subscriptionPeriodEnd: number | undefined;
            if (fullSession.subscription) {
                const typedSubscription =
                    fullSession.subscription as Stripe.Subscription;
                if (
                    typedSubscription.cancel_at_period_end &&
                    typedSubscription.cancel_at
                ) {
                    subscriptionPeriodEnd = typedSubscription.cancel_at;
                } else {
                    // Get current_period_end from the first subscription item
                    const firstItem = typedSubscription.items?.data?.[0];
                    subscriptionPeriodEnd = firstItem?.current_period_end;
                }
            }

            subscriptionFulfilmentDto.validUntil = this.mapNewValidUntil(
                subscriptionFulfilmentDto.paymentSystemMode,
                true,
                subscriptionPeriodEnd
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
        const stripeProduct = product as Stripe.Product;
        const stripeCustomer = customer as Stripe.Customer;

        subscriptionFulfilmentDto.paymentSystemProductId = stripeProduct?.id;

        subscriptionFulfilmentDto.internalSku =
            stripeProduct?.metadata?.internalSku;
        subscriptionFulfilmentDto.productDisplayName = stripeProduct.name;

        subscriptionFulfilmentDto.paymentSystemCustomerId =
            stripeCustomer?.id || "unknown";

        subscriptionFulfilmentDto.paymentSystemCustomerEmail =
            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
            stripeCustomer?.email || altEmail || altEmail2 || "unknown";

        return subscriptionFulfilmentDto;
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
        stripeCurrentPeriodEnd?: number | null
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
                `Set valid until to ${newValidUntil.toISOString()} based on sub ${stripeCurrentPeriodEnd.toString()}`
            );
        }

        return newValidUntil;
    }

    public mapSubscriptionToSubRecord(
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

            // Use cancel_at if cancellation is scheduled, otherwise use current_period_end from the item
            const periodEnd =
                fullSubscription.cancel_at_period_end &&
                fullSubscription.cancel_at
                    ? fullSubscription.cancel_at
                    : lineItem.current_period_end;

            subscriptionFulfilmentDto.validUntil = this.mapNewValidUntil(
                subscriptionFulfilmentDto.paymentSystemMode,
                additionalMeta.isActive,
                periodEnd
            );

            subs.push(subscriptionFulfilmentDto);
        }
        return subs;
    }
}
