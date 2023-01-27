/* eslint-disable @typescript-eslint/naming-convention */
import {Inject, Injectable} from "@nestjs/common";
import Stripe from "stripe";
import CoreLoggerService from "../../logger/CoreLoggerService";
import {Person} from "../../person/entities/person.entity";
import {StripeCheckoutSessionParameters} from "../models/StripeCheckoutSessionParams";
import {StripeClientConfigurationService} from "../StripeClientConfigurationService";

@Injectable()
export class StripeCheckoutService {
    constructor(
        private readonly logger: CoreLoggerService,
        @Inject("StripeClient")
        private readonly clientInstance: Stripe,
        private readonly stripeClientConfigurationService: StripeClientConfigurationService
    ) {
        this.logger.log("Setting up twitter client");
    }

    public async createCustomerPortalSession(parameters: {
        user: Omit<Person, "nullChecks">;
    }) {
        // TODO: This is a hack to get the customer ID. We should be able to get it from the user.
        const customerId = parameters.user.auth0UserId;
        const session = await this.clientInstance.billingPortal.sessions.create(
            {
                customer: customerId,
                return_url: `${this.stripeClientConfigurationService.stripeRedirectsBaseUrl}/my/account`,
            }
        );

        return session.url;
    }

    public async createCheckoutSession(
        parameters: StripeCheckoutSessionParameters
    ): Promise<string> {
        const mappedParameters = {
            mode: parameters.mode as unknown as Stripe.Checkout.SessionCreateParams.Mode,
            client_reference_id: parameters.clientReferenceId,
            line_items: parameters.lineItems,
            success_url: `${this.stripeClientConfigurationService.stripeRedirectsBaseUrl}${parameters.successFrontendPath}`,
            cancel_url: parameters.cancelFrontendPath
                ? `${this.stripeClientConfigurationService.stripeRedirectsBaseUrl}${parameters.cancelFrontendPath}`
                : undefined,
        } as Stripe.Checkout.SessionCreateParams;

        const session = await this.clientInstance.checkout.sessions.create(
            mappedParameters
        );

        if (!session.url) {
            throw new Error("Failed to create checkout session");
        }

        return session.url;
    }
}
