import {ApiProperty} from "@nestjs/swagger";
import {IsArray, IsInt} from "class-validator";

export class CreateUpdateMembershipDto {
    @ApiProperty()
    @IsInt()
    userId!: number;

    @ApiProperty({type: String, isArray: true})
    @IsArray()
    roles!: string[];
}
