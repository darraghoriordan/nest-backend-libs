/* eslint-disable sonarjs/no-duplicate-string */
import {
    Controller,
    Request,
    Param,
    Get,
    Post,
    Body,
    Delete,
} from "@nestjs/common";
import {ApiBearerAuth, ApiOkResponse, ApiTags} from "@nestjs/swagger";
import {RequestWithUser} from "../authorization/models/RequestWithUser.js";
import {OrganisationSubscriptionRecord} from "./entities/organisation-subscription.entity.js";
import {OrganisationSubscriptionService} from "./organisation-subscriptions.service.js";

import {SaveOrganisationSubscriptionRecordDto} from "./models/fulfillSubscriptionDto.js";
import {BooleanResult} from "../root-app/models/boolean-result.js";
import {MandatoryUserClaims} from "../authorization/guards/MandatoryUserClaims.decorator.js";

@ApiBearerAuth()
@Controller("organisation/:orgId/subscriptions")
@ApiTags("Organisation Subscriptions")
export class OrganisationSubscriptionsController {
    constructor(private readonly osrService: OrganisationSubscriptionService) {}

    @Get()
    @ApiOkResponse({type: [OrganisationSubscriptionRecord]})
    async findAll(
        @Param("orgId") orgId: number,
        @Request() request: RequestWithUser
    ): Promise<OrganisationSubscriptionRecord[]> {
        return this.osrService.findAllForOwnerOfOrg(orgId, request.user.id);
    }

    @MandatoryUserClaims("modify:all")
    @Post()
    @ApiOkResponse({type: [OrganisationSubscriptionRecord]})
    async addSubscription(
        @Param("orgId") orgId: number,
        @Body() body: SaveOrganisationSubscriptionRecordDto
    ): Promise<OrganisationSubscriptionRecord[]> {
        return this.osrService.save([body], orgId);
    }

    @MandatoryUserClaims("modify:all")
    @Delete(":uuid")
    @ApiOkResponse({type: BooleanResult})
    async deleteSubscription(
        @Param("orgId") orgId: number,
        @Param("uuid") uuid: string
    ): Promise<BooleanResult> {
        const isDeleted = await this.osrService.delete(uuid);
        return {result: isDeleted};
    }
}
