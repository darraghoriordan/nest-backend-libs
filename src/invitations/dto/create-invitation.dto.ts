import {ApiProperty} from "@nestjs/swagger";
import {IsEmail, IsInt, IsString, MinLength} from "class-validator";

export class CreateInvitationDto {
    @ApiProperty()
    @IsString()
    @MinLength(1)
    givenName!: string;

    @ApiProperty()
    @IsEmail()
    emailAddress!: string;

    @ApiProperty()
    @IsInt()
    organisationId!: number;
}
