import {
    Controller,
    Get,
    Request,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
} from "@nestjs/common";
import {OrganisationService} from "./organisation.service";
import {UpdateOrganisationDto} from "./dto/update-organisation.dto";
import {ApiBearerAuth, ApiOkResponse, ApiTags} from "@nestjs/swagger";
import {Organisation} from "./entities/organisation.entity";
import {AuthGuard} from "@nestjs/passport";
import {RequestWithUser} from "../authz/RequestWithUser";

@UseGuards(AuthGuard("jwt"))
@ApiBearerAuth()
@Controller("organisation")
@ApiTags("organisations")
export class OrganisationController {
    constructor(private readonly organisationService: OrganisationService) {}

    @Get(":uuid")
    @ApiOkResponse({type: Organisation})
    async findOne(
        @Param("uuid") uuid: string,
        @Request() request: RequestWithUser
    ) {
        return this.organisationService.findOne(uuid, request.user.id);
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    @Get()
    @ApiOkResponse({type: Organisation, isArray: true})
    async findAllForUser(
        @Request() request: RequestWithUser
    ): Promise<Organisation[]> {
        return this.organisationService.findAllForUser(request.user.id);
    }

    @Patch(":uuid")
    @ApiOkResponse({type: Organisation})
    async update(
        @Param("uuid") uuid: string,
        @Body() updateOrganisationDto: UpdateOrganisationDto,
        @Request() request: RequestWithUser
    ) {
        return this.organisationService.update(
            uuid,
            updateOrganisationDto,
            request.user.id
        );
    }

    @Delete(":uuid")
    @ApiOkResponse({type: Organisation})
    async remove(
        @Param("uuid") uuid: string,
        @Request() request: RequestWithUser
    ): Promise<boolean> {
        const deleteResult = await this.organisationService.remove(
            uuid,
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
