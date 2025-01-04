/* eslint-disable sonarjs/no-duplicate-string */
import {
    Controller,
    Request,
    Param,
    Get,
    Post,
    Body,
    Delete,
    UseGuards,
} from "@nestjs/common";
import {
    ApiBearerAuth,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
} from "@nestjs/swagger";
import {RequestWithUser} from "../authorization/models/RequestWithUser.js";
import {OrganisationSubscriptionRecord} from "./entities/organisation-subscription.entity.js";
import {OrganisationSubscriptionService} from "./organisation-subscriptions.service.js";
import {SaveOrganisationSubscriptionRecordDto} from "./models/fulfillSubscriptionDto.js";
import {BooleanResult} from "../root-app/dtos/boolean-result.js";
import {MandatoryUserClaims} from "../authorization/guards/MandatoryUserClaims.decorator.js";
import {DefaultAuthGuard} from "../authorization/guards/DefaultAuthGuard.js";
import {ClaimsAuthorisationGuard} from "../authorization/guards/ClaimsAuthorisationGuard.js";

@ApiBearerAuth()
@UseGuards(DefaultAuthGuard, ClaimsAuthorisationGuard)
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
    @ApiOperation({tags: ["SuperPower"]})
    @Post()
    @ApiOkResponse({type: [OrganisationSubscriptionRecord]})
    async addSubscription(
        @Param("orgUuid") orgUuid: string,
        @Body() body: SaveOrganisationSubscriptionRecordDto
    ): Promise<OrganisationSubscriptionRecord[]> {
        return this.osrService.save([body], orgUuid);
    }

    @MandatoryUserClaims("modify:all")
    @ApiOperation({tags: ["SuperPower"]})
    @Delete(":uuid")
    @ApiOkResponse({type: BooleanResult})
    async deleteSubscription(
        @Param("orgUuid") orgUuId: string,
        @Param("uuid") uuid: string
    ): Promise<BooleanResult> {
        const isDeleted = await this.osrService.delete({
            orgUuId,
            subScriptionUuid: uuid,
        });
        return {result: isDeleted};
    }
}
