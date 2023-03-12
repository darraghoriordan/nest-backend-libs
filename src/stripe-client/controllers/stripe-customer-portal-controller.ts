import {UseGuards, Controller, Post, Request, Body} from "@nestjs/common";
import {AuthGuard} from "@nestjs/passport";
import {ApiBearerAuth, ApiTags, ApiOkResponse} from "@nestjs/swagger";
import {RequestWithUser} from "../../authorization/models/RequestWithUser.js";
import {StripeCheckoutService} from "./../services/stripe-checkout.service.js";
import {StripeCustomerPortalResponseDto} from "../models/StripeCustomerPortalResponseDto.js";
import {StripeCustomerPortalRequestDto} from "../models/StripeCustomerPortalRequestDto.js";

@Controller("payments/stripe")
@ApiTags("Payments")
export class StripeCustomerPortalController {
    constructor(private readonly stripeService: StripeCheckoutService) {}

    @UseGuards(AuthGuard("jwt"))
    @ApiBearerAuth()
    @Post("customer-portal-session")
    @ApiOkResponse({
        type: StripeCustomerPortalResponseDto,
        description: "The URL to the customer portal",
    })
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async createCustomerPortalSession(
        @Request() request: RequestWithUser,
        @Body() body: StripeCustomerPortalRequestDto
    ): Promise<StripeCustomerPortalResponseDto> {
        return await this.stripeService.createCustomerPortalSession(
            body,
            request.user
        );
    }
}
