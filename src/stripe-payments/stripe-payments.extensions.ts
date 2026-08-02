import {ForbiddenException, Injectable} from "@nestjs/common";
import type {RequestUser} from "../authorization/models/RequestWithUser.js";

export const STRIPE_PAYMENTS_ACCESS_POLICY = Symbol(
    "STRIPE_PAYMENTS_ACCESS_POLICY"
);
export const STRIPE_PAYMENTS_TELEMETRY = Symbol("STRIPE_PAYMENTS_TELEMETRY");
export const STRIPE_PAYMENTS_ENTITLEMENT_STORE = Symbol(
    "STRIPE_PAYMENTS_ENTITLEMENT_STORE"
);

export interface StripePaymentsAccessContext {
    organisationUuid: string;
    user: RequestUser;
    operation: "checkout" | "customer-portal";
}

export interface StripePaymentsAccessPolicy {
    assertCanManageOrganisation(
        context: StripePaymentsAccessContext
    ): void | Promise<void>;
}

export interface StripePaymentsEntitlement {
    uuid: string;
    organisationUuid: string;
    paymentSystemTransactionId: string;
    paymentSystemCustomerId: string;
    paymentSystemMode: string;
}

export interface StripePaymentsEntitlementInput {
    paymentSystemTransactionId: string;
    paymentSystemProductId: string;
    paymentSystemCustomerId: string;
    paymentSystemCustomerEmail: string;
    paymentSystemMode: "subscription" | "payment";
    paymentSystemName: "stripe";
    validUntil: Date;
    internalSku: string;
    productDisplayName: string;
    organisationUuid?: string;
    stripeEventId: string;
    stripeEventCreatedAt: Date;
    stripeStatus: string;
}

export type StripePaymentsRevocationInput = Pick<
    StripePaymentsEntitlementInput,
    "stripeEventId" | "stripeEventCreatedAt" | "stripeStatus"
>;

export interface StripePaymentsEntitlementStore {
    findByUuid(uuid: string): Promise<StripePaymentsEntitlement>;
    findByTransactionId(
        paymentSystemTransactionId: string
    ): Promise<StripePaymentsEntitlement | null>;
    save(input: StripePaymentsEntitlementInput): Promise<void>;
    revokeCustomerPayments(
        customerId: string,
        input: StripePaymentsRevocationInput
    ): Promise<void>;
    revokePayment(
        paymentSystemTransactionId: string,
        input: StripePaymentsRevocationInput
    ): Promise<boolean>;
}

export type StripePaymentsTelemetryEvent =
    | {
          name: "checkout.created";
          attemptId: number;
          organisationUuid: string;
          productKey: string;
          stripeSessionId: string;
      }
    | {
          name: "checkout.failed";
          attemptId: number;
          organisationUuid: string;
          productKey: string;
          error: string;
      }
    | {
          name: "webhook.received" | "webhook.processed" | "webhook.failed";
          stripeEventId: string;
          eventType: string;
          error?: string;
      };

export interface StripePaymentsTelemetry {
    record(event: StripePaymentsTelemetryEvent): void | Promise<void>;
}

@Injectable()
export class DefaultStripePaymentsAccessPolicy implements StripePaymentsAccessPolicy {
    assertCanManageOrganisation(context: StripePaymentsAccessContext): void {
        const isOwner = context.user.memberships
            ?.filter((membership) =>
                membership.roles?.some((role) => role.name === "owner")
            )
            .some(
                (membership) =>
                    membership.organisation.uuid === context.organisationUuid
            );
        if (!isOwner) {
            throw new ForbiddenException(
                "You are not the owner of this organisation"
            );
        }
    }
}

export class NoopStripePaymentsTelemetry implements StripePaymentsTelemetry {
    record(): void {
        return;
    }
}
