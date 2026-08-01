import {
    BadRequestException,
    Controller,
    Get,
    Param,
    Post,
    Query,
    UseGuards,
} from "@nestjs/common";
import {
    ApiBearerAuth,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
} from "@nestjs/swagger";
import {ClaimsAuthorisationGuard} from "../../authorization/guards/ClaimsAuthorisationGuard.js";
import {DefaultAuthGuard} from "../../authorization/guards/DefaultAuthGuard.js";
import {MandatoryUserClaims} from "../../authorization/guards/MandatoryUserClaims.decorator.js";
import {StripeCheckoutEvent} from "../entities/stripe-payment-event.entity.js";
import {StripePaymentEventService} from "../services/stripe-payment-event.service.js";
import {StripeEventsQueryDto} from "../models/secure-checkout.dto.js";

@Controller("payments/stripe/events")
@ApiTags("Payments")
@ApiBearerAuth()
@UseGuards(DefaultAuthGuard, ClaimsAuthorisationGuard)
export class SecureStripeEventsController {
    constructor(private readonly eventService: StripePaymentEventService) {}

    @Get()
    @MandatoryUserClaims("read:all")
    @ApiOperation({tags: ["SuperPower"]})
    @ApiOkResponse({type: [StripeCheckoutEvent]})
    getEvents(
        @Query() query: StripeEventsQueryDto
    ): Promise<StripeCheckoutEvent[]> {
        return this.eventService.list(query.take, query.skip);
    }

    @Post(":eventId/replay")
    @UseGuards(DefaultAuthGuard, ClaimsAuthorisationGuard)
    @MandatoryUserClaims("read:all")
    @ApiOperation({tags: ["SuperPower"]})
    @ApiOkResponse({type: Object})
    replay(@Param("eventId") eventId: string): Promise<void> {
        if (!/^evt_[A-Za-z0-9]+$/.test(eventId)) {
            throw new BadRequestException("Invalid Stripe event ID");
        }
        return this.eventService.replay(eventId);
    }
}
