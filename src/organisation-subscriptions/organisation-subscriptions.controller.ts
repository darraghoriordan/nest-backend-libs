/* eslint-disable sonarjs/no-duplicate-string */
import {
    Controller,
    Request,
    Param,
    UseGuards,
    Get,
    Post,
    Body,
    Delete,
} from "@nestjs/common";
import {ApiBearerAuth, ApiOkResponse, ApiTags} from "@nestjs/swagger";
import {AuthGuard} from "@nestjs/passport";
import {RequestWithUser} from "../authz/RequestWithUser";
import {OrganisationSubscriptionRecord} from "./entities/organisation-subscription.entity";
import {OrganisationSubscriptionService} from "./organisation-subscriptions.service";
import {ClaimsAuthorisationGuard, MandatoryUserClaims} from "../authz";
import {SaveOrganisationSubscriptionRecordDto} from "./models/fulfillSubscriptionDto";

@UseGuards(AuthGuard("jwt"), ClaimsAuthorisationGuard)
@ApiBearerAuth()
@Controller("organisation/:orgUuid/subscriptions")
@ApiTags("Organisation Subscriptions")
export class OrganisationSubscriptionsController {
    constructor(private readonly osrService: OrganisationSubscriptionService) {}

    @Get()
    @ApiOkResponse({type: [OrganisationSubscriptionRecord]})
    async findAll(
        @Param("orgUuid") orgUuid: string,
        @Request() request: RequestWithUser
    ) {
        return this.osrService.findAllForOwnerOfOrg(orgUuid, request.user.id);
    }

    @MandatoryUserClaims("modify:all")
    @Post()
    @ApiOkResponse({type: OrganisationSubscriptionRecord})
    async addSubscription(
        @Param("orgUuid") orgUuid: string,
        @Body() body: SaveOrganisationSubscriptionRecordDto[]
    ) {
        return this.osrService.save(body);
    }

    @MandatoryUserClaims("modify:all")
    @Delete(":uuid")
    @ApiOkResponse({type: Boolean})
    async deleteSubscription(
        @Param("orgUuid") orgUuid: string,
        @Param("uuid") uuid: string
    ): Promise<boolean> {
        return this.osrService.delete(uuid);
    }
}
