import {ApiProperty} from "@nestjs/swagger";
import {User} from "../../user-internal/entities/user.entity.js";

export class CreateOrganisationDto {
    @ApiProperty({type: User, isArray: true})
    members!: User[];

    @ApiProperty({type: User})
    owner!: User;

    @ApiProperty()
    name!: string;
}
