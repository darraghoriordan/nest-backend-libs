import {Injectable} from "@nestjs/common";
import {
    StripePaymentsEntitlement,
    StripePaymentsEntitlementInput,
    StripePaymentsEntitlementStore,
    StripePaymentsRevocationInput,
} from "../stripe-payments.extensions.js";
import {SecureSubscriptionService} from "./secure-subscription.service.js";

@Injectable()
export class DefaultStripePaymentsEntitlementStore implements StripePaymentsEntitlementStore {
    constructor(
        private readonly subscriptionService: SecureSubscriptionService
    ) {}

    async findByUuid(uuid: string): Promise<StripePaymentsEntitlement> {
        const record = await this.subscriptionService.findByUuid(uuid);
        return this.map(record);
    }

    async findByTransactionId(
        paymentSystemTransactionId: string
    ): Promise<StripePaymentsEntitlement | null> {
        const record = await this.subscriptionService.findByTransactionId(
            paymentSystemTransactionId
        );
        return record ? this.map(record) : null;
    }

    async save(input: StripePaymentsEntitlementInput): Promise<void> {
        await this.subscriptionService.save(input);
    }

    revokeCustomerPayments(
        customerId: string,
        input: StripePaymentsRevocationInput
    ): Promise<void> {
        return this.subscriptionService.revokeCustomerPayments(
            customerId,
            input
        );
    }

    revokePayment(
        paymentSystemTransactionId: string,
        input: StripePaymentsRevocationInput
    ): Promise<boolean> {
        return this.subscriptionService.revokePayment(
            paymentSystemTransactionId,
            input
        );
    }

    private map(record: {
        uuid: string;
        organisation: {uuid: string};
        paymentSystemTransactionId: string;
        paymentSystemCustomerId: string;
        paymentSystemMode: string;
    }): StripePaymentsEntitlement {
        return {
            uuid: record.uuid,
            organisationUuid: record.organisation.uuid,
            paymentSystemTransactionId: record.paymentSystemTransactionId,
            paymentSystemCustomerId: record.paymentSystemCustomerId,
            paymentSystemMode: record.paymentSystemMode,
        };
    }
}
