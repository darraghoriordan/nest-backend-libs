/* eslint-disable @typescript-eslint/naming-convention */
import {Injectable, Logger} from "@nestjs/common";
import {RequestUser} from "../../authorization/models/RequestWithUser.js";
import {StripeCheckoutSessionRequestDto} from "../models/StripeCheckoutSessionRequestDto.js";
import {StripeCheckoutSessionResponseDto} from "../models/StripeCheckoutSessionResponseDto.js";
import {StripeCustomerPortalResponseDto} from "../models/StripeCustomerPortalResponseDto.js";
import {StripeCustomerPortalRequestDto} from "../models/StripeCustomerPortalRequestDto.js";
import {OrganisationSubscriptionService} from "../../organisation-subscriptions/organisation-subscriptions.service.js";
import {StripeCheckoutService} from "./stripe-checkout.service.js";

@Injectable()
export class AuthenticatedStripeCheckoutService {
    private readonly logger = new Logger(
        AuthenticatedStripeCheckoutService.name
    );
    constructor(
        private readonly organisationSubscriptionService: OrganisationSubscriptionService,
        private readonly stripeCheckoutService: StripeCheckoutService
    ) {}

    // must set the org id to the customer id field so we can get this later
    public async createCustomerPortalSession(
        parameters: StripeCustomerPortalRequestDto,
        user: RequestUser
    ): Promise<StripeCustomerPortalResponseDto> {
        // is the user an owner of the organisation with the subscription record
        const subscriptionRecord =
            await this.organisationSubscriptionService.findOne(
                parameters.subscriptionRecordUuid
            );
        if (
            !user.memberships ||
            !user.memberships
                .filter((m) => m.roles?.some((r) => r.name === "owner"))
                .map((m) => m.organisation.uuid)
                .includes(subscriptionRecord.organisation.uuid)
        ) {
            {
                this.logger.error(
                    "Create Stripe session error. Not an owner of the organisation",
                    {
                        userUuid: user.uuid,
                        organisationUuid: subscriptionRecord.organisation.uuid,
                    }
                );
                throw new Error(
                    "You are not a member of the organisation associated with this billing account"
                );
            }
        }
        return this.stripeCheckoutService.createStripePortalSession(
            subscriptionRecord.paymentSystemCustomerId,
            parameters.returnUrl
        );
    }

    public async createCheckoutSession(
        parameters: StripeCheckoutSessionRequestDto,
        user: RequestUser
    ): Promise<StripeCheckoutSessionResponseDto> {
        // is the current user the owner of the org?
        if (
            !parameters.organisationUuid ||
            !user.memberships ||
            !user.memberships
                .filter((m) => m.roles?.some((r) => r.name === "owner"))
                .map((m) => m.organisation.uuid)
                .includes(parameters.organisationUuid)
        ) {
            this.logger.error(
                "Create Stripe session error. Not an owner of the organisation",
                {
                    userUuid: user.uuid,
                    organisationUuid: parameters.organisationUuid,
                }
            );
            throw new Error("You are not the owner of this organisation");
        }

        return this.stripeCheckoutService.createCheckoutSession(parameters);
    }
}
