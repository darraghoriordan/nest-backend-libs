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

    @ApiProperty()
    @Transform(() => Date)
    @Type(() => Date)
    @IsDate()
    validUntil!: Date;

    @ApiProperty()
    @IsString()
    organisationUuid!: string;
}
