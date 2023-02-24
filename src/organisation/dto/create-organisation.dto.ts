import {ApiProperty} from "@nestjs/swagger";
import {Person} from "../../person-internal/entities/person.entity";

export class CreateOrganisationDto {
    @ApiProperty({type: Person, isArray: true})
    members!: Person[];

    @ApiProperty({type: Person})
    owner!: Person;

    @ApiProperty()
    name!: string;
}
