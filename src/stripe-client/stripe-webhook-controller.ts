import {Controller, Post, RawBodyRequest, Req} from "@nestjs/common";

import {ApiTags, ApiOkResponse, ApiBadRequestResponse} from "@nestjs/swagger";
import {Request as ExpressRequest} from "express";
import {StripeWebhookHandler} from "./services/stripe-webhook-handler.service";

/*
 * This is a controller that is used to receive webhooks from Stripe.
 * It is not used to send requests to Stripe.
 * It is automatically registered by the StripeClientModule.
 */
@Controller("payments/stripe")
@ApiTags("payments")
export class StripeWebhookController {
    constructor(private readonly stripeWebhookService: StripeWebhookHandler) {}

    // eslint-disable-next-line @typescript-eslint/require-await
    @Post("webhook-receiver")
    @ApiOkResponse()
    @ApiBadRequestResponse()
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, unicorn/prevent-abbreviations
    async webhookReceiver(@Req() req: RawBodyRequest<ExpressRequest>) {
        return this.stripeWebhookService.handleWebhook(req);
    }
}
