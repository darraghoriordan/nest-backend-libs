 
import {Controller, Request, UseGuards, Get} from "@nestjs/common";
import {
    ApiBearerAuth,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
} from "@nestjs/swagger";
import {RequestWithUser} from "../authorization/models/RequestWithUser.js";
import {PaymentSessionService} from "./payment-session.service.js";
import {PaymentSessionReference} from "./payment-session.entity.js";
import {ClaimsAuthorisationGuard} from "../authorization/guards/ClaimsAuthorisationGuard.js";
import {DefaultAuthGuard} from "../authorization/guards/DefaultAuthGuard.js";
import {MandatoryUserClaims} from "../authorization/guards/MandatoryUserClaims.decorator.js";

@UseGuards(DefaultAuthGuard, ClaimsAuthorisationGuard)
@ApiBearerAuth()
@Controller("payment-reference")
@ApiTags("Payment references")
export class PaymentSessionReferenceController {
    constructor(
        private readonly paymentReferenceService: PaymentSessionService
    ) {}

    @MandatoryUserClaims("read:all")
    @ApiOperation({tags: ["SuperPower"]})
    @Get()
    @ApiOkResponse({type: [PaymentSessionReference]})
    async findAll(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        @Request() request: RequestWithUser
    ): Promise<PaymentSessionReference[]> {
        return this.paymentReferenceService.findAll();
    }
}
