import {ApiProperty} from "@nestjs/swagger";
import {IsNotEmpty, IsString} from "class-validator";

export default class CreateApiKeyDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    description!: string;
}
