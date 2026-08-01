import {
    Body,
    Controller,
    Headers,
    Post,
    Request,
    UseGuards,
} from "@nestjs/common";
import {
    ApiBearerAuth,
    ApiHeader,
    ApiOkResponse,
    ApiTags,
} from "@nestjs/swagger";
import {DefaultAuthGuard} from "../../authorization/guards/DefaultAuthGuard.js";
import {RequestWithUser} from "../../authorization/models/RequestWithUser.js";
import {SecureStripeCheckoutService} from "../services/secure-stripe-checkout.service.js";
import {
    StripeCheckoutSessionRequestDto,
    StripeCustomerPortalRequestDto,
} from "../models/secure-checkout.dto.js";
import {
    StripeCheckoutSessionResponseDto,
    StripeCustomerPortalResponseDto,
} from "../models/secure-payment-response.dto.js";

@Controller("payments/stripe")
@ApiTags("Payments")
@ApiBearerAuth()
export class SecureStripeCheckoutController {
    constructor(
        private readonly checkoutService: SecureStripeCheckoutService
    ) {}

    @Post("checkout-session")
    @UseGuards(DefaultAuthGuard)
    @ApiHeader({name: "Idempotency-Key", required: true})
    @ApiOkResponse({type: StripeCheckoutSessionResponseDto})
    createCheckoutSession(
        @Request() request: RequestWithUser,
        @Headers("idempotency-key") idempotencyKey: string | undefined,
        @Body() body: StripeCheckoutSessionRequestDto
    ): Promise<StripeCheckoutSessionResponseDto> {
        return this.checkoutService.createCheckoutSession(
            body,
            request.user,
            idempotencyKey
        );
    }

    @Post("customer-portal-session")
    @UseGuards(DefaultAuthGuard)
    @ApiHeader({name: "Idempotency-Key", required: true})
    @ApiOkResponse({
        type: StripeCustomerPortalResponseDto,
        description: "The URL to the customer portal",
    })
    createCustomerPortalSession(
        @Request() request: RequestWithUser,
        @Headers("idempotency-key") idempotencyKey: string | undefined,
        @Body() body: StripeCustomerPortalRequestDto
    ): Promise<StripeCustomerPortalResponseDto> {
        return this.checkoutService.createCustomerPortalSession(
            body,
            request.user,
            idempotencyKey
        );
    }
}
