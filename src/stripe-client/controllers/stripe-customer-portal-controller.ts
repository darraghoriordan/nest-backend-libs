import {UseGuards, Controller, Post, Request} from "@nestjs/common";
import {AuthGuard} from "@nestjs/passport";
import {ApiBearerAuth, ApiTags, ApiOkResponse} from "@nestjs/swagger";
import {RequestWithUser} from "../../authz/RequestWithUser";
import {StripeCheckoutService} from "./../services/stripe-checkout.service";

@Controller("payments/stripe")
@ApiTags("Payments")
export class StripeCustomerPortalController {
    constructor(private readonly stripeService: StripeCheckoutService) {}

    @UseGuards(AuthGuard("jwt"))
    @ApiBearerAuth()
    @Post("customer-portal-session")
    @ApiOkResponse({
        type: String,
        description: "The URL to the customer portal",
    })
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async createCustomerPortalSession(@Request() request: RequestWithUser) {
        return this.stripeService.createCustomerPortalSession({
            user: request.user,
        });
    }
}
