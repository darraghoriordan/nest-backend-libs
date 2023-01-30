import {
    Controller,
    Request,
    Body,
    Param,
    Delete,
    UseGuards,
    Post,
} from "@nestjs/common";
import {ApiBearerAuth, ApiOkResponse, ApiTags} from "@nestjs/swagger";

import {AuthGuard} from "@nestjs/passport";
import {RequestWithUser} from "../authz/RequestWithUser";
import {OrganisationMembershipsService} from "./organisation-memberships.service";
import {Organisation} from "../organisation/entities/organisation.entity";
import {CreateUpdateMembershipDto} from "./dtos/create-membership-dto";

@UseGuards(AuthGuard("jwt"))
@ApiBearerAuth()
@Controller("organisation/:orgUuid/memberships")
@ApiTags("organisations")
export class OrganisationMembershipsController {
    constructor(private readonly omService: OrganisationMembershipsService) {}

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
    @ApiOkResponse({type: Organisation})
    async remove(
        @Param("orgUuid") orgUuid: string,
        @Param("membershipUuid") membershipUuid: string,
        @Request() request: RequestWithUser
    ): Promise<boolean> {
        const deleteResult = await this.omService.remove(
            orgUuid,
            membershipUuid,
            request.user.id
        );
        return (
            deleteResult !== undefined &&
            deleteResult.affected !== undefined &&
            deleteResult?.affected !== null &&
            deleteResult?.affected > 0
        );
    }
}
