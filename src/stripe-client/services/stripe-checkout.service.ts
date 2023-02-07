/* eslint-disable @typescript-eslint/naming-convention */
import {Inject, Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import Stripe from "stripe";
import {Repository} from "typeorm";
import {RequestPerson} from "../../authz/RequestWithUser";
import CoreLoggerService from "../../logger/CoreLoggerService";
import {StripeCheckoutEvent} from "../entities/stripe-checkout-event.entity";
import {StripeCheckoutSessionRequestDto} from "../models/StripeCheckoutSessionRequestDto";
import {StripeCheckoutSessionResponseDto} from "../models/StripeCheckoutSessionResponseDto";
import {StripeClientConfigurationService} from "../StripeClientConfigurationService";

@Injectable()
export class StripeCheckoutService {
    constructor(
        private readonly logger: CoreLoggerService,
        @Inject("StripeClient")
        private readonly clientInstance: Stripe,
        private readonly stripeClientConfigurationService: StripeClientConfigurationService,
        @InjectRepository(StripeCheckoutEvent)
        private eventRepository: Repository<StripeCheckoutEvent>
    ) {
        this.logger.log("Setting up twitter client");
    }

    public async createCustomerPortalSession(parameters: {
        user: RequestPerson;
    }): Promise<string> {
        const customerId = parameters.user.uuid;
        const session = await this.clientInstance.billingPortal.sessions.create(
            {
                customer: customerId,
                return_url: `${this.stripeClientConfigurationService.stripeRedirectsBaseUrl}/my/account`,
            }
        );

        return session.url;
    }

    public async createAuthenticatedCheckoutSession(
        parameters: StripeCheckoutSessionRequestDto,
        user: RequestPerson
    ): Promise<StripeCheckoutSessionResponseDto> {
        const mappedParameters = {
            mode: parameters.mode as unknown as Stripe.Checkout.SessionCreateParams.Mode,
            client_reference_id: user.uuid,
            line_items: parameters.lineItems,
            customer_email: user.email,
            success_url: `${this.stripeClientConfigurationService.stripeRedirectsBaseUrl}${parameters.successFrontendPath}`,
            cancel_url: parameters.cancelFrontendPath
                ? `${this.stripeClientConfigurationService.stripeRedirectsBaseUrl}${parameters.cancelFrontendPath}`
                : undefined,
        } as Stripe.Checkout.SessionCreateParams;

        return this.createSession(mappedParameters);
    }

    public async createCheckoutSession(
        parameters: StripeCheckoutSessionRequestDto
    ): Promise<StripeCheckoutSessionResponseDto> {
        const mappedParameters = {
            mode: parameters.mode as unknown as Stripe.Checkout.SessionCreateParams.Mode,
            client_reference_id: parameters.clientReferenceId,
            line_items: parameters.lineItems,
            success_url: `${this.stripeClientConfigurationService.stripeRedirectsBaseUrl}${parameters.successFrontendPath}`,
            cancel_url: parameters.cancelFrontendPath
                ? `${this.stripeClientConfigurationService.stripeRedirectsBaseUrl}${parameters.cancelFrontendPath}`
                : undefined,
        } as Stripe.Checkout.SessionCreateParams;

        return this.createSession(mappedParameters);
    }

    private async createSession(
        mappedParameters: Stripe.Checkout.SessionCreateParams
    ): Promise<StripeCheckoutSessionResponseDto> {
        const session = await this.clientInstance.checkout.sessions.create(
            mappedParameters
        );

        if (!session.url) {
            throw new Error("Failed to create checkout session");
        }

        const eventModel = this.eventRepository.create({
            stripeData: JSON.stringify(session),
            stripeObjectType: session.object,
            stripeSessionId: session.id,
        });

        await this.eventRepository.save(eventModel);

        const response = new StripeCheckoutSessionResponseDto();

        response.stripeSessionUrl = session.url;
        response.stripeSessionId = session.id;

        return response;
    }
}
