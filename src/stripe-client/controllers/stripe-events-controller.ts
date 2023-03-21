import {UseGuards, Controller, Request, Get, Query} from "@nestjs/common";
import {
    ApiBearerAuth,
    ApiTags,
    ApiOkResponse,
    ApiQuery,
    ApiOperation,
} from "@nestjs/swagger";
import {RequestWithUser} from "../../authorization/models/RequestWithUser.js";
import {StripeCheckoutService} from "../services/stripe-checkout.service.js";

import {StripeCheckoutEvent} from "../entities/stripe-checkout-event.entity.js";
import {ClaimsAuthorisationGuard} from "../../authorization/guards/ClaimsAuthorisationGuard.js";
import {DefaultAuthGuard} from "../../authorization/guards/DefaultAuthGuard.js";
import {MandatoryUserClaims} from "../../authorization/guards/MandatoryUserClaims.decorator.js";

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
    @ApiOperation({tags: ["SuperPower"]})
    @Get()
    @ApiQuery({name: "take", required: true, type: Number})
    @ApiQuery({name: "skip", required: true, type: Number})
    @ApiOkResponse({type: StripeCheckoutEvent, isArray: true})
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async getLastEvents(
        @Request() request: RequestWithUser,
        @Query() query: EventQuery
    ): Promise<StripeCheckoutEvent[]> {
        return this.stripeService.getLast(query.take, query.skip);
    }
}
