/* eslint-disable @typescript-eslint/naming-convention */
import {Inject, Injectable, Logger} from "@nestjs/common";
import Stripe from "stripe";
import {RequestPerson} from "../../authz/RequestWithUser";
import {StripeCheckoutSessionRequestDto} from "../models/StripeCheckoutSessionRequestDto";
import {StripeCheckoutSessionResponseDto} from "../models/StripeCheckoutSessionResponseDto";
import {StripeClientConfigurationService} from "../StripeClientConfigurationService";
import {PaymentSessionService} from "../../payment-sessions/payment-session.service";
import {OrganisationSubscriptionService} from "../../organisation-subscriptions";
import {StripeCustomerPortalResponseDto} from "../models/StripeCustomerPortalResponseDto";
import {StripeCustomerPortalRequestDto} from "../models/StripeCustomerPortalRequestDto";

@Injectable()
export class StripeCheckoutService {
    private readonly logger = new Logger(StripeCheckoutService.name);
    constructor(
        @Inject("StripeClient")
        private readonly clientInstance: Stripe,
        private readonly stripeClientConfigurationService: StripeClientConfigurationService,
        private readonly paymentSessionService: PaymentSessionService,
        private readonly organisationSubscriptionService: OrganisationSubscriptionService
    ) {}

    // must set the org id to the customer id field so we can get this later
    public async createCustomerPortalSession(
        parameters: StripeCustomerPortalRequestDto,
        user: RequestPerson
    ): Promise<StripeCustomerPortalResponseDto> {
        // is the user a member of the organisation with the subscription record
        const subscriptionRecord =
            await this.organisationSubscriptionService.findOne(
                parameters.subscriptionRecordUuid
            );
        if (
            !user.memberships
                .map((m) => m.organisation.uuid)
                .includes(subscriptionRecord.organisation.uuid)
        ) {
            {
                throw new Error(
                    "You are not a member of the organisation associated with this billing account"
                );
            }
        }

        const session = await this.clientInstance.billingPortal.sessions.create(
            {
                customer: subscriptionRecord.paymentSystemCustomerId,
                return_url: `${this.stripeClientConfigurationService.stripeRedirectsBaseUrl}${parameters.returnUrl}`,
            }
        );

        return {sessionUrl: session.url};
    }

    public async createAuthenticatedCheckoutSession(
        parameters: StripeCheckoutSessionRequestDto,
        user: RequestPerson
    ): Promise<StripeCheckoutSessionResponseDto> {
        // create a new session in the database
        const paymentReference = await this.paymentSessionService.createSession(
            {
                organisationUuid: parameters.organisationId,
                personUuid: user.uuid,
            }
        );

        const mappedParameters = {
            mode: parameters.mode as unknown as Stripe.Checkout.SessionCreateParams.Mode,
            client_reference_id: paymentReference.uuid,
            line_items: parameters.lineItems,
            customer_email: user.email,
            success_url: `${this.stripeClientConfigurationService.stripeRedirectsBaseUrl}${parameters.successFrontendPath}`,
            cancel_url: parameters.cancelFrontendPath
                ? `${this.stripeClientConfigurationService.stripeRedirectsBaseUrl}${parameters.cancelFrontendPath}`
                : undefined,
        } as Stripe.Checkout.SessionCreateParams;

        return this.createStripeSession(mappedParameters);
    }

    public async createCheckoutSession(
        parameters: StripeCheckoutSessionRequestDto
    ): Promise<StripeCheckoutSessionResponseDto> {
        // create a new session in the database
        const paymentReference = await this.paymentSessionService.createSession(
            {
                organisationUuid: parameters.organisationId,
            }
        );

        const mappedParameters = {
            mode: parameters.mode as unknown as Stripe.Checkout.SessionCreateParams.Mode,
            client_reference_id: paymentReference.uuid,
            line_items: parameters.lineItems,
            success_url: `${this.stripeClientConfigurationService.stripeRedirectsBaseUrl}${parameters.successFrontendPath}`,
            cancel_url: parameters.cancelFrontendPath
                ? `${this.stripeClientConfigurationService.stripeRedirectsBaseUrl}${parameters.cancelFrontendPath}`
                : undefined,
        } as Stripe.Checkout.SessionCreateParams;

        return this.createStripeSession(mappedParameters);
    }

    private async createStripeSession(
        mappedParameters: Stripe.Checkout.SessionCreateParams
    ): Promise<StripeCheckoutSessionResponseDto> {
        const session = await this.clientInstance.checkout.sessions.create(
            mappedParameters
        );

        if (!session.url) {
            this.logger.error("Failed to create stripe checkout session", {
                mappedParameters,
            });
            throw new Error("Failed to create checkout session");
        }

        const response = new StripeCheckoutSessionResponseDto();

        response.stripeSessionUrl = session.url;
        response.stripeSessionId = session.id;

        return response;
    }
}
