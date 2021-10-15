import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
} from "@nestjs/common";
import {OrganisationService} from "./organisation.service";
import {CreateOrganisationDto} from "./dto/create-organisation.dto";
import {UpdateOrganisationDto} from "./dto/update-organisation.dto";
import {ApiBearerAuth, ApiOkResponse, ApiTags} from "@nestjs/swagger";
import {Organisation} from "./entities/organisation.entity";
import {AuthGuard} from "@nestjs/passport";
@UseGuards(AuthGuard("jwt"))
@ApiBearerAuth()
@Controller("organisation")
@ApiTags("organisations")
export class OrganisationController {
    constructor(private readonly organisationService: OrganisationService) {}

    @Post()
    @ApiOkResponse({type: Organisation})
    async create(
        @Body() createOrganisationDto: CreateOrganisationDto
    ): Promise<Organisation> {
        return this.organisationService.create(createOrganisationDto);
    }

    @Get()
    @ApiOkResponse({type: Organisation, isArray: true})
    async findAll() {
        return this.organisationService.findAll();
    }

    @Get(":id")
    @ApiOkResponse({type: Organisation})
    async findOne(@Param("id") id: string) {
        return this.organisationService.findOne(+id);
    }

    @Patch(":id")
    @ApiOkResponse({type: Organisation})
    async update(
        @Param("id") id: string,
        @Body() updateOrganisationDto: UpdateOrganisationDto
    ) {
        return this.organisationService.update(+id, updateOrganisationDto);
    }

    @Delete(":id")
    @ApiOkResponse({type: Organisation})
    async remove(@Param("id") id: string): Promise<boolean> {
        const deleteResult = await this.organisationService.remove(+id);
        return (
            deleteResult !== undefined &&
            deleteResult.affected !== undefined &&
            deleteResult?.affected !== null &&
            deleteResult?.affected > 0
        );
    }
}
