import {
    Controller,
    Get,
    Request,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    BadRequestException,
} from "@nestjs/common";
import {PersonService} from "./person.service";
import {UpdatePersonDto} from "./dto/update-person.dto";
import {ApiBearerAuth, ApiOkResponse, ApiTags} from "@nestjs/swagger";
import {Person} from "./entities/person.entity";
import {AuthGuard} from "@nestjs/passport";
import {RequestWithUser} from "../authz/RequestWithUser";
import {isUUID} from "class-validator";
import {BooleanResult} from "../root-app/models/boolean-result";
@UseGuards(AuthGuard("jwt"))
@ApiBearerAuth()
@Controller("person")
@ApiTags("Persons")
export class PersonController {
    constructor(private readonly personService: PersonService) {}

    @Get(":uuid")
    @ApiOkResponse({type: Person})
    async findOne(
        @Request() request: RequestWithUser,
        @Param("uuid") uuid: string
    ) {
        if (uuid === "me") {
            return this.personService.findOne(request.user.id);
        }
        if (!isUUID(uuid, "4")) {
            throw new BadRequestException(uuid, "Invalid UUID");
        }

        // find the person if they are in the same organisation as the user
        return await this.personService.findOneIfSameOrganisation(
            uuid,
            request.user
        );
    }

    @Patch(":uuid")
    @ApiOkResponse({type: BooleanResult})
    async update(
        @Param("uuid") uuid: string,
        @Body() updatePersonDto: UpdatePersonDto,
        @Request() request: RequestWithUser
    ) {
        const result = await this.personService.update(
            uuid,
            updatePersonDto,
            request.user.uuid
        );
        return {result: result.affected && result.affected > 0};
    }

    @Delete(":uuid")
    @ApiOkResponse({type: BooleanResult})
    async remove(
        @Param("uuid") uuid: string,
        @Request() request: RequestWithUser
    ): Promise<BooleanResult> {
        const deleteResult = await this.personService.remove(
            uuid,
            request.user.uuid
        );
        return {result: deleteResult !== undefined};
    }
}
