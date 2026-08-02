import {Invitation} from "../invitations/entities/invitation.entity.js";
import {OrganisationMembership} from "../organisation-memberships/entities/organisation-membership.entity.js";
import {OrganisationSubscriptionRecord} from "../organisation-subscriptions/entities/organisation-subscription.entity.js";
import {MembershipRole} from "../organisation/entities/member-role.entity.js";
import {Organisation} from "../organisation/entities/organisation.entity.js";
import {PaymentSessionReference} from "../payment-sessions/payment-session.entity.js";
import {Email} from "../smtp-email-client/email.entity.js";
import {StripeCheckoutEvent as LegacyStripeCheckoutEvent} from "../stripe-client/entities/stripe-checkout-event.entity.js";
import {StripeCheckoutAttempt} from "../stripe-payments/entities/stripe-checkout-attempt.entity.js";
import {StripeCheckoutEvent} from "../stripe-payments/entities/stripe-payment-event.entity.js";
import {StripePaymentState} from "../stripe-payments/entities/stripe-payment-state.entity.js";
import {UserApiKey} from "../user-api-key/userApiKey.entity.js";
import {User} from "../user/entities/user.entity.js";

export const STRIPE_PAYMENTS_ENTITIES = [
    StripeCheckoutAttempt,
    StripeCheckoutEvent,
    StripePaymentState,
] as const;

export const NEST_BACKEND_LIB_ENTITIES = [
    Invitation,
    OrganisationMembership,
    OrganisationSubscriptionRecord,
    MembershipRole,
    Organisation,
    PaymentSessionReference,
    Email,
    LegacyStripeCheckoutEvent,
    ...STRIPE_PAYMENTS_ENTITIES,
    UserApiKey,
    User,
] as const;
