/* eslint-disable sonarjs/no-duplicate-string */
import {
    Controller,
    Request,
    Param,
    UseGuards,
    Get,
    Post,
    Body,
    Put,
    Delete,
} from "@nestjs/common";
import {ApiBearerAuth, ApiOkResponse, ApiTags} from "@nestjs/swagger";
import {AuthGuard} from "@nestjs/passport";
import {RequestWithUser} from "../authz/RequestWithUser";
import {OrganisationSubscriptionRecord} from "./entities/organisation-subscription.entity";
import {OrganisationSubscriptionService} from "./organisation-subscriptions.service";
import {ClaimsAuthorisationGuard, MandatoryUserClaims} from "../authz";
import {SaveOrganisationSubscriptionRecordDto} from "./models/saveSubscriptionDto";

@UseGuards(AuthGuard("jwt"), ClaimsAuthorisationGuard)
@ApiBearerAuth()
@Controller("organisation/:orgUuid/subscriptions")
@ApiTags("Organisations")
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
        @Body() body: SaveOrganisationSubscriptionRecordDto
    ) {
        return this.osrService.create(body);
    }

    @MandatoryUserClaims("modify:all")
    @Put(":uuid")
    @ApiOkResponse({type: OrganisationSubscriptionRecord})
    async updateSubscription(
        @Param("uuid") subUuid: string,
        @Param("orgUuid") orgUuid: string,
        @Body() body: SaveOrganisationSubscriptionRecordDto
    ) {
        return this.osrService.update(subUuid, body);
    }
    @MandatoryUserClaims("modify:all")
    @Delete(":uuid")
    @ApiOkResponse({type: [OrganisationSubscriptionRecord]})
    async deleteSubscription(
        @Param("orgUuid") orgUuid: string,
        @Param("uuid") uuid: string
    ) {
        return this.osrService.delete(uuid);
    }
}
