/* eslint-disable sonarjs/no-duplicate-string */
import {Controller, UseGuards, Get} from "@nestjs/common";
import {ApiBearerAuth, ApiOkResponse, ApiTags} from "@nestjs/swagger";
import {ClaimsAuthorisationGuard} from "../authorization/guards/ClaimsAuthorisationGuard.js";
import {DefaultAuthGuard} from "../authorization/guards/DefaultAuthGuard.js";
import {MandatoryUserClaims} from "../authorization/guards/MandatoryUserClaims.decorator.js";
import {OrganisationSubscriptionRecord} from "./entities/organisation-subscription.entity.js";
import {OrganisationSubscriptionService} from "./organisation-subscriptions.service.js";

@UseGuards(DefaultAuthGuard, ClaimsAuthorisationGuard)
@ApiBearerAuth()
@Controller("subscriptions")
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
