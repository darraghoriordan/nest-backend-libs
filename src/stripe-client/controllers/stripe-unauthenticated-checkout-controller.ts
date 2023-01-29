import {Controller, Post, Body} from "@nestjs/common";
import {ApiTags, ApiOkResponse} from "@nestjs/swagger";
import {StripeCheckoutSessionRequestDto} from "./../models/StripeCheckoutSessionRequestDto";
import {StripeCheckoutService} from "./../services/stripe-checkout.service";
import {StripeCheckoutSessionResponseDto} from "./../models/StripeCheckoutSessionResponseDto";

/**
 * This controller creates checkout sessions for Stripe.
 * It does not require the user to be logged in.
 * So it does not add the user's email address and user ID to the stripe session.
 *
 * This is not automatically included in the StripeClientModule.
 */
@Controller("payments/stripe")
@ApiTags("payments")
// eslint-disable-next-line @darraghor/nestjs-typed/injectable-should-be-provided
export class StripeUnauthenticatedCheckoutController {
    constructor(private readonly stripeService: StripeCheckoutService) {}

    @Post("checkout-session-unauthenticated")
    @ApiOkResponse({type: StripeCheckoutSessionResponseDto})
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async createCheckoutSession(
        @Body() createSessionDto: StripeCheckoutSessionRequestDto
    ): Promise<StripeCheckoutSessionResponseDto> {
        return this.stripeService.createCheckoutSession(createSessionDto);
    }
}
