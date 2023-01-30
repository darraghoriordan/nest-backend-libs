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
import {PersonService} from "./person.service";
import {UpdatePersonDto} from "./dto/update-person.dto";
import {ApiBearerAuth, ApiOkResponse, ApiTags} from "@nestjs/swagger";
import {Person} from "./entities/person.entity";
import {AuthGuard} from "@nestjs/passport";
import {RequestWithUser} from "../authz/RequestWithUser";
@UseGuards(AuthGuard("jwt"))
@ApiBearerAuth()
@Controller("person")
@ApiTags("Persons")
export class PersonController {
    constructor(private readonly personService: PersonService) {}

    @Get()
    @ApiOkResponse({type: Person})
    async findSelf(@Request() request: RequestWithUser) {
        return this.personService.findOne(request.user.id);
    }

    @Patch(":uuid")
    @ApiOkResponse({type: Person})
    async update(
        @Param("uuid") uuid: string,
        @Body() updatePersonDto: UpdatePersonDto,
        @Request() request: RequestWithUser
    ) {
        return this.personService.update(
            uuid,
            updatePersonDto,
            request.user.uuid
        );
    }

    @Delete(":uuid")
    @ApiOkResponse({type: Person})
    async remove(
        @Param("uuid") uuid: string,
        @Request() request: RequestWithUser
    ): Promise<boolean> {
        const deleteResult = await this.personService.remove(
            uuid,
            request.user.uuid
        );
        return deleteResult !== undefined;
    }
}
