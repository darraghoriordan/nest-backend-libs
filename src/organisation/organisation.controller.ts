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
import {OrganisationService} from "./organisation.service.js";
import {UpdateOrganisationDto} from "./dto/update-organisation.dto.js";
import {ApiBearerAuth, ApiOkResponse, ApiTags} from "@nestjs/swagger";
import {Organisation} from "./entities/organisation.entity.js";
import {AuthGuard} from "@nestjs/passport";
import {RequestWithUser} from "../authorization/models/RequestWithUser.js";
import {BooleanResult} from "../root-app/dtos/boolean-result.js";

@UseGuards(AuthGuard("jwt"))
@ApiBearerAuth()
@Controller("organisation")
@ApiTags("Organisations")
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
    @ApiOkResponse({type: BooleanResult})
    async remove(
        @Param("uuid") uuid: string,
        @Request() request: RequestWithUser
    ): Promise<BooleanResult> {
        await this.organisationService.remove(uuid, request.user.id);
        return {result: true};
    }
}
