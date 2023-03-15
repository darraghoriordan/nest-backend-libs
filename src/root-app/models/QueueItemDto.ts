import {ApiProperty, ApiPropertyOptional} from "@nestjs/swagger";
import {Transform, Type} from "class-transformer";
import {Allow, IsDate, IsOptional, IsString} from "class-validator";

export class QueueItemDto {
    @ApiProperty()
    @IsString()
    id!: string;

    @Transform(({value}) => new Date(value as string))
    @Type(() => Date)
    @IsDate()
    @ApiProperty({type: Date})
    @Allow()
    queueDateLocal!: Date;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    @ApiProperty()
    @IsString()
    result!: string;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    @ApiProperty()
    @IsString()
    data!: string;

    @ApiPropertyOptional()
    @IsOptional()
    failReason?: string;
}
