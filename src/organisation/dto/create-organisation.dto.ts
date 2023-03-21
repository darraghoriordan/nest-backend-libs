import {ApiProperty} from "@nestjs/swagger";
import {Type} from "class-transformer";
import {
    IsArray,
    IsDefined,
    IsString,
    MinLength,
    ValidateNested,
} from "class-validator";
import {User} from "../../user/entities/user.entity.js";

export class CreateOrganisationDto {
    @Type(() => User)
    @ApiProperty({type: User, isArray: true})
    @ValidateNested({each: true})
    @IsArray()
    members!: User[];

    @Type(() => User)
    @IsDefined()
    @ApiProperty({type: User})
    owner!: User;

    @ApiProperty()
    @IsString()
    @MinLength(1)
    name!: string;
}
