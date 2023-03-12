import {UseGuards, Controller, Post, Body, Request} from "@nestjs/common";
import {AuthGuard} from "@nestjs/passport";
import {ApiBearerAuth, ApiTags, ApiOkResponse} from "@nestjs/swagger";
import {RequestWithUser} from "../../authorization/models/RequestWithUser.js";
import {StripeCheckoutSessionRequestDto} from "../models/StripeCheckoutSessionRequestDto.js";
import {StripeCheckoutService} from "../services/stripe-checkout.service.js";
import {StripeCheckoutSessionResponseDto} from "../models/StripeCheckoutSessionResponseDto.js";

/**
 * This controller creates authenticated checkout sessions for Stripe.
 * It adds the user's email address and user ID to the session.
 * Users MUST be logged in to use this controller.
 *
 * This is not automatically included in the StripeClientModule.
 */
@UseGuards(AuthGuard("jwt"))
@ApiBearerAuth()
@Controller("payments/stripe")
@ApiTags("Payments")
// eslint-disable-next-line @darraghor/nestjs-typed/injectable-should-be-provided
export class StripeCheckoutController {
    constructor(private readonly stripeService: StripeCheckoutService) {}

    @Post("checkout-session")
    @ApiOkResponse({type: StripeCheckoutSessionResponseDto})
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async createCheckoutSession(
        @Request() request: RequestWithUser,
        @Body() createSessionDto: StripeCheckoutSessionRequestDto
    ): Promise<StripeCheckoutSessionResponseDto> {
        return this.stripeService.createAuthenticatedCheckoutSession(
            createSessionDto,
            request.user
        );
    }
}
