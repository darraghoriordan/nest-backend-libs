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
import {RequestWithUser} from "../authz/RequestWithUser";
import {OrganisationMembershipsService} from "./organisation-memberships.service";
import {Organisation} from "../organisation/entities/organisation.entity";
import {CreateUpdateMembershipDto} from "./dtos/create-membership-dto";
import {OrganisationMembership} from "./entities/organisation-membership.entity";
import {BooleanResult} from "../root-app/models/boolean-result";

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
        const deleteResult = await this.omService.remove(
            orgUuid,
            membershipUuid,
            request.user.id
        );
        return {
            result:
                deleteResult !== undefined &&
                deleteResult.affected !== undefined &&
                deleteResult?.affected !== null &&
                deleteResult?.affected > 0,
        };
    }
}
