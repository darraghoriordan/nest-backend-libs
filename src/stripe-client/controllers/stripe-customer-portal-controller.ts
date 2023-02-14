import {UseGuards, Controller, Post, Request} from "@nestjs/common";
import {AuthGuard} from "@nestjs/passport";
import {ApiBearerAuth, ApiTags, ApiOkResponse} from "@nestjs/swagger";
import {RequestWithUser} from "../../authz/RequestWithUser";
import {StripeCheckoutService} from "./../services/stripe-checkout.service";
import {UrlResponseDto} from "../models/UrlResponseDto";

@Controller("payments/stripe")
@ApiTags("Payments")
export class StripeCustomerPortalController {
    constructor(private readonly stripeService: StripeCheckoutService) {}

    @UseGuards(AuthGuard("jwt"))
    @ApiBearerAuth()
    @Post("customer-portal-session")
    @ApiOkResponse({
        type: UrlResponseDto,
        description: "The URL to the customer portal",
    })
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async createCustomerPortalSession(@Request() request: RequestWithUser) {
        const result = await this.stripeService.createCustomerPortalSession({
            user: request.user,
        });
        return {
            url: result,
        };
    }
}
