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
        const stripeProduct = product as Stripe.Product;
        const stripeCustomer = customer as Stripe.Customer;

        subscriptionFulfilmentDto.paymentSystemProductId = stripeProduct?.id;

        subscriptionFulfilmentDto.internalSku =
            stripeProduct?.metadata?.internalSku;
        subscriptionFulfilmentDto.productDisplayName = stripeProduct.name;

        subscriptionFulfilmentDto.paymentSystemCustomerId =
            stripeCustomer?.id || "unknown";

        subscriptionFulfilmentDto.paymentSystemCustomerEmail =
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

            subscriptionFulfilmentDto.validUntil = this.mapNewValidUntil(
                subscriptionFulfilmentDto.paymentSystemMode,
                additionalMeta.isActive,
                fullSubscription.current_period_end
            );

            subs.push(subscriptionFulfilmentDto);
        }
        return subs;
    }
}
