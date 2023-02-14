/* eslint-disable sonarjs/no-duplicate-string */
import {Controller, Request, UseGuards, Get} from "@nestjs/common";
import {ApiBearerAuth, ApiOkResponse, ApiTags} from "@nestjs/swagger";
import {RequestWithUser} from "../authz/RequestWithUser";
import {
    ClaimsAuthorisationGuard,
    DefaultAuthGuard,
    MandatoryUserClaims,
} from "../authz";
import {PaymentSessionService} from "./payment-session.service";
import {PaymentSessionReference} from "./payment-session.entity";

@UseGuards(DefaultAuthGuard, ClaimsAuthorisationGuard)
@ApiBearerAuth()
@Controller("payment-reference")
@ApiTags("Payment references")
export class PaymentSessionReferenceController {
    constructor(
        private readonly paymentReferenceService: PaymentSessionService
    ) {}

    @MandatoryUserClaims("read:all")
    @Get()
    @ApiOkResponse({type: [PaymentSessionReference]})
    async findAll(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        @Request() request: RequestWithUser
    ): Promise<PaymentSessionReference[]> {
        return this.paymentReferenceService.findAll();
    }
}
