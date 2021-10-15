import {
    Controller,
    Get,
    Post,
    Request,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
} from "@nestjs/common";
import {PersonService} from "./person.service";
import {CreatePersonDto} from "./dto/create-person.dto";
import {UpdatePersonDto} from "./dto/update-person.dto";
import {ApiBearerAuth, ApiOkResponse, ApiTags} from "@nestjs/swagger";
import {Person} from "./entities/person.entity";
import {AuthGuard} from "@nestjs/passport";
import {RequestWithUser} from "../authz/RequestWithUser";
@UseGuards(AuthGuard("jwt"))
@ApiBearerAuth()
@Controller("person")
@ApiTags("persons")
export class PersonController {
    constructor(private readonly personService: PersonService) {}

    @Post()
    @ApiOkResponse({type: Person})
    async create(@Body() createPersonDto: CreatePersonDto): Promise<Person> {
        return this.personService.create(createPersonDto);
    }

    @Get()
    @ApiOkResponse({type: Person})
    async findSelf(@Request() request: RequestWithUser) {
        return this.personService.findOne(request.user.id);
    }

    @Patch(":id")
    @ApiOkResponse({type: Person})
    async update(
        @Param("id") id: string,
        @Body() updatePersonDto: UpdatePersonDto
    ) {
        return this.personService.update(+id, updatePersonDto);
    }

    @Delete(":id")
    @ApiOkResponse({type: Person})
    async remove(@Param("id") id: string): Promise<boolean> {
        const deleteResult = await this.personService.remove(+id);
        return (
            deleteResult !== undefined &&
            deleteResult.affected !== undefined &&
            deleteResult?.affected !== null &&
            deleteResult?.affected > 0
        );
    }
}
