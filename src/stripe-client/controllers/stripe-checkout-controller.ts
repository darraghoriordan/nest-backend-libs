import {UseGuards, Controller, Post, Body, Request} from "@nestjs/common";
import {AuthGuard} from "@nestjs/passport";
import {ApiBearerAuth, ApiTags, ApiOkResponse} from "@nestjs/swagger";
import {RequestWithUser} from "../../authz/RequestWithUser";
import {StripeCheckoutSessionRequestDto} from "../models/StripeCheckoutSessionRequestDto";
import {StripeCheckoutService} from "../services/stripe-checkout.service";
import {StripeCheckoutSessionResponseDto} from "../models/StripeCheckoutSessionResponseDto";

/**
 * This controller creates authenticated checkout sessions for Stripe.
 * It adds the user's email address and user ID to the session.
 * Users MUST be logged in to use this controller.
 *
 * This is not automatically included in the StripeClientModule.
 */
@Controller("payments/stripe")
@ApiTags("Payments")
// eslint-disable-next-line @darraghor/nestjs-typed/injectable-should-be-provided
export class StripeCheckoutController {
    constructor(private readonly stripeService: StripeCheckoutService) {}

    @UseGuards(AuthGuard("jwt"))
    @ApiBearerAuth()
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
