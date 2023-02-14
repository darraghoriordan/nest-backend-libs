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
import {BooleanResult} from "../root-app/models/boolean-result";

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
    ): Promise<OrganisationSubscriptionRecord[]> {
        return this.osrService.findAllForOwnerOfOrg(orgUuid, request.user.id);
    }

    @MandatoryUserClaims("modify:all")
    @Post()
    @ApiOkResponse({type: [OrganisationSubscriptionRecord]})
    async addSubscription(
        @Param("orgUuid") orgUuid: string,
        @Body() body: SaveOrganisationSubscriptionRecordDto[]
    ): Promise<OrganisationSubscriptionRecord[]> {
        return this.osrService.save(body);
    }

    @MandatoryUserClaims("modify:all")
    @Delete(":uuid")
    @ApiOkResponse({type: BooleanResult})
    async deleteSubscription(
        @Param("orgUuid") orgUuid: string,
        @Param("uuid") uuid: string
    ): Promise<BooleanResult> {
        const isDeleted = await this.osrService.delete(uuid);
        return {result: isDeleted};
    }
}
