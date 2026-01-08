import {UseGuards, Controller, Post, Body, Request} from "@nestjs/common";
import {ApiBearerAuth, ApiTags, ApiOkResponse} from "@nestjs/swagger";
import {DefaultAuthGuard} from "../../authorization/guards/DefaultAuthGuard.js";
import {RequestWithUser} from "../../authorization/models/RequestWithUser.js";
import {StripeCheckoutSessionRequestDto} from "../models/StripeCheckoutSessionRequestDto.js";
import {StripeCheckoutSessionResponseDto} from "../models/StripeCheckoutSessionResponseDto.js";
import {AuthenticatedStripeCheckoutService} from "../services/auth-stripe-checkout.service.js";

/**
 * This controller creates authenticated checkout sessions for Stripe.
 * It adds the user's email address and user ID to the session.
 * Users MUST be logged in to use this controller.
 *
 * This is not automatically included in the StripeClientModule.
 */
@UseGuards(DefaultAuthGuard)
@ApiBearerAuth()
@Controller("payments/stripe")
@ApiTags("Payments")
 
export class StripeCheckoutController {
    constructor(
        private readonly stripeService: AuthenticatedStripeCheckoutService
    ) {}

    @Post("checkout-session")
    @ApiOkResponse({type: StripeCheckoutSessionResponseDto})
    async createCheckoutSession(
        @Request() request: RequestWithUser,
        @Body() createSessionDto: StripeCheckoutSessionRequestDto
    ): Promise<StripeCheckoutSessionResponseDto> {
        return this.stripeService.createCheckoutSession(
            createSessionDto,
            request.user
        );
    }
}
