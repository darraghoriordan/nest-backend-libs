 
import {Inject, Injectable, Logger} from "@nestjs/common";
import Stripe from "stripe";
import {StripeCheckoutSessionRequestDto} from "../models/StripeCheckoutSessionRequestDto.js";
import {StripeCheckoutSessionResponseDto} from "../models/StripeCheckoutSessionResponseDto.js";
import {StripeClientConfigurationService} from "../StripeClientConfigurationService.js";
import {PaymentSessionService} from "../../payment-sessions/payment-session.service.js";
import {InjectRepository} from "@nestjs/typeorm";
import {StripeCheckoutEvent} from "../entities/stripe-checkout-event.entity.js";
import {Repository} from "typeorm";
import {StripeCustomerPortalResponseDto} from "../models/StripeCustomerPortalResponseDto.js";
import {RequestUser} from "../../authorization/models/RequestWithUser.js";

@Injectable()
export class StripeCheckoutService {
    private readonly logger = new Logger(StripeCheckoutService.name);
    constructor(
        @Inject("StripeClient")
        private readonly clientInstance: Stripe,
        private readonly stripeClientConfigurationService: StripeClientConfigurationService,
        private readonly paymentSessionService: PaymentSessionService,
        @InjectRepository(StripeCheckoutEvent)
        private readonly stripeCheckoutEventRepository: Repository<StripeCheckoutEvent>
    ) {}

    public async createCheckoutSession(
        parameters: StripeCheckoutSessionRequestDto,
        requestUser?: RequestUser
    ): Promise<StripeCheckoutSessionResponseDto> {
        // create a new session in the database
        const paymentReference = await this.paymentSessionService.createSession(
            {
                organisationUuid: parameters.organisationUuid,
                userUuid: requestUser?.uuid,
            }
        );

        const mappedSessionParameters = {
            mode: parameters.mode as unknown as Stripe.Checkout.SessionCreateParams.Mode,
            client_reference_id: paymentReference.uuid,
            line_items: parameters.lineItems,
            success_url: `${this.stripeClientConfigurationService.stripeRedirectsBaseUrl}${parameters.successFrontendPath}`,
            cancel_url: parameters.cancelFrontendPath
                ? `${this.stripeClientConfigurationService.stripeRedirectsBaseUrl}${parameters.cancelFrontendPath}`
                : undefined,
        } as Stripe.Checkout.SessionCreateParams;

        const session = await this.clientInstance.checkout.sessions.create(
            mappedSessionParameters
        );

        if (!session.url) {
            this.logger.error("Failed to create stripe checkout session", {
                mappedSessionParameters,
            });
            throw new Error("Failed to create checkout session");
        }

        return {stripeSessionUrl: session.url, stripeSessionId: session.id};
    }

    public async createStripePortalSession(
        paymentSystemCustomerId: string,
        returnUrl: string
    ): Promise<StripeCustomerPortalResponseDto> {
        const session = await this.clientInstance.billingPortal.sessions.create(
            {
                customer: paymentSystemCustomerId,
                return_url: `${this.stripeClientConfigurationService.stripeRedirectsBaseUrl}${returnUrl}`,
            }
        );

        return {sessionUrl: session.url};
    }

    public async getLast(
        take: number,
        skip: number
    ): Promise<StripeCheckoutEvent[]> {
        return this.stripeCheckoutEventRepository.find({
            take: take,
            skip: skip,
            order: {
                createdDate: "DESC",
            },
        });
    }
}
