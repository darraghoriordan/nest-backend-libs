import {
    Controller,
    Request,
    Body,
    Param,
    Delete,
    UseGuards,
    Post,
    Get,
} from "@nestjs/common";
import {ApiBearerAuth, ApiOkResponse, ApiTags} from "@nestjs/swagger";
import {AuthGuard} from "@nestjs/passport";
import {RequestWithUser} from "../authorization/models/RequestWithUser.js";
import {OrganisationMembershipsService} from "./organisation-memberships.service.js";
import {Organisation} from "../organisation/entities/organisation.entity.js";
import {CreateUpdateMembershipDto} from "./dtos/create-membership-dto.js";
import {OrganisationMembership} from "./entities/organisation-membership.entity.js";
import {BooleanResult} from "../root-app/models/boolean-result.js";

@UseGuards(AuthGuard("jwt"))
@ApiBearerAuth()
@Controller("organisation/:orgUuid/memberships")
@ApiTags("Organisation Memberships")
export class OrganisationMembershipsController {
    constructor(private readonly omService: OrganisationMembershipsService) {}

    @Get()
    @ApiOkResponse({type: [OrganisationMembership]})
    async findAll(
        @Param("orgUuid") orgUuid: string,
        @Request() request: RequestWithUser
    ): Promise<OrganisationMembership[]> {
        return this.omService.findAllForOrgUser(orgUuid, request.user.id);
    }

    @Post()
    @ApiOkResponse({type: Organisation})
    async createOrUpdate(
        @Param("orgUuid") orgUuid: string,
        @Body() updateOrganisationDto: CreateUpdateMembershipDto,
        @Request() request: RequestWithUser
    ) {
        return this.omService.createOrUpdate(
            orgUuid,
            updateOrganisationDto,
            request.user.id
        );
    }

    @Delete(":membershipUuid")
    @ApiOkResponse({type: BooleanResult})
    async remove(
        @Param("orgUuid") orgUuid: string,
        @Param("membershipUuid") membershipUuid: string,
        @Request() request: RequestWithUser
    ): Promise<BooleanResult> {
        await this.omService.remove(orgUuid, membershipUuid, request.user.id);
        return {result: true};
    }
}
