import {ApiProperty} from "@nestjs/swagger";
import {Transform, Type} from "class-transformer";
import {IsDate, IsString} from "class-validator";

export class SaveOrganisationSubscriptionRecordDto {
    @ApiProperty()
    @IsString()
    stripeSubscriptionId!: string;

    @ApiProperty()
    @IsString()
    stripeCustomerId!: string;

    @ApiProperty()
    @IsString()
    stripePriceId!: string;

    @Transform(({value}) => new Date(value as string))
    @Type(() => Date)
    @IsDate()
    @ApiProperty({type: Date})
    validUntil!: Date;
}
