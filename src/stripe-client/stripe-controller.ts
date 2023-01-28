import {
    UseGuards,
    Controller,
    Post,
    Body,
    RawBodyRequest,
    Req,
    Request,
} from "@nestjs/common";
import {AuthGuard} from "@nestjs/passport";
import {
    ApiBearerAuth,
    ApiTags,
    ApiOkResponse,
    ApiBadRequestResponse,
} from "@nestjs/swagger";
import {RequestWithUser} from "../authz/RequestWithUser";
import {StripeCheckoutSessionRequestDto} from "./models/StripeCheckoutSessionRequestDto";
import {StripeCheckoutService} from "./services/stripe-checkout.service";
import {Request as ExpressRequest} from "express";
import {StripeWebhookHandler} from "./services/stripe-webhook-handler.service";
import {StripeCheckoutSessionResponseDto} from "./models/StripeCheckoutSessionResponseDto";

@Controller("payments/stripe")
@ApiTags("payments")
export class StripeClientController {
    constructor(
        private readonly stripeService: StripeCheckoutService,
        private readonly stripeWebhookService: StripeWebhookHandler
    ) {}

    // eslint-disable-next-line @typescript-eslint/require-await
    @Post("webhook-receiver")
    @ApiOkResponse()
    @ApiBadRequestResponse()
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, unicorn/prevent-abbreviations
    async webhookReceiver(@Req() req: RawBodyRequest<ExpressRequest>) {
        return this.stripeWebhookService.handleWebhook(req);
    }

    @UseGuards(AuthGuard("jwt"))
    @ApiBearerAuth()
    @Post("customer-portal-session")
    @ApiOkResponse()
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async createCustomerPortalSession(@Request() request: RequestWithUser) {
        return this.stripeService.createCustomerPortalSession({
            user: request.user,
        });
    }

    // @UseGuards(AuthGuard("jwt"))
    // @ApiBearerAuth()
    @Post("checkout-session")
    @ApiOkResponse({type: StripeCheckoutSessionResponseDto})
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async createCheckoutSession(
        @Request() request: RequestWithUser,
        @Body() createSessionDto: StripeCheckoutSessionRequestDto
    ): Promise<StripeCheckoutSessionResponseDto> {
        return this.stripeService.createCheckoutSession(createSessionDto);
    }
}
