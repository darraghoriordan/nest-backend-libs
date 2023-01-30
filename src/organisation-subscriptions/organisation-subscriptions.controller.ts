import {Controller, Request, Param, UseGuards, Get} from "@nestjs/common";
import {ApiBearerAuth, ApiOkResponse, ApiTags} from "@nestjs/swagger";
import {AuthGuard} from "@nestjs/passport";
import {RequestWithUser} from "../authz/RequestWithUser";
import {OrganisationSubscriptionRecord} from "./entities/organisation-subscription.entity";
import {OrganisationSubscriptionService} from "./organisation-subscriptions.service";

@UseGuards(AuthGuard("jwt"))
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
}
