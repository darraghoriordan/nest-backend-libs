/* eslint-disable sonarjs/no-duplicate-string */
import {Controller, UseGuards, Get} from "@nestjs/common";
import {ApiBearerAuth, ApiOkResponse, ApiTags} from "@nestjs/swagger";
import {AuthGuard} from "@nestjs/passport";
import {OrganisationSubscriptionRecord} from "./entities/organisation-subscription.entity";
import {OrganisationSubscriptionService} from "./organisation-subscriptions.service";
import {ClaimsAuthorisationGuard, MandatoryUserClaims} from "../authz";

@UseGuards(AuthGuard("jwt"), ClaimsAuthorisationGuard)
@ApiBearerAuth()
@Controller("organisation/subscriptions")
@ApiTags("Organisation Subscriptions")
export class AllSubscriptionsController {
    constructor(private readonly osrService: OrganisationSubscriptionService) {}

    @MandatoryUserClaims("read:all")
    @Get()
    @ApiOkResponse({type: [OrganisationSubscriptionRecord]})
    async findAll(): Promise<OrganisationSubscriptionRecord[]> {
        return this.osrService.findAll();
    }
}
