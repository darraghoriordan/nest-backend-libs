import {UseGuards, Controller, Request, Get, Query} from "@nestjs/common";
import {ApiBearerAuth, ApiTags, ApiOkResponse, ApiQuery} from "@nestjs/swagger";
import {RequestWithUser} from "../../authz/RequestWithUser";
import {StripeCheckoutService} from "../services/stripe-checkout.service";
import {StripeCheckoutSessionResponseDto} from "../models/StripeCheckoutSessionResponseDto";
import {
    ClaimsAuthorisationGuard,
    DefaultAuthGuard,
    MandatoryUserClaims,
} from "../../authz";
import {StripeCheckoutEvent} from "../entities/stripe-checkout-event.entity";

export type EventQuery = {
    take: number;
    skip: number;
};

@UseGuards(DefaultAuthGuard, ClaimsAuthorisationGuard)
@ApiBearerAuth()
@Controller("payments/stripe/events")
@ApiTags("Payments")
export class StripeEventsController {
    constructor(private readonly stripeService: StripeCheckoutService) {}

    @MandatoryUserClaims("read:all")
    @Get()
    @ApiQuery({name: "take", required: true, type: Number})
    @ApiQuery({name: "skip", required: true, type: Number})
    @ApiOkResponse({type: StripeCheckoutSessionResponseDto, isArray: true})
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async getLastEvents(
        @Request() request: RequestWithUser,
        @Query() query: EventQuery
    ): Promise<StripeCheckoutEvent[]> {
        return this.stripeService.getLast(query.take, query.skip);
    }
}
