import {ApiProperty, ApiPropertyOptional} from "@nestjs/swagger";
import {Transform, Type} from "class-transformer";
import {IsDate, IsOptional, IsString} from "class-validator";

export class SaveOrganisationSubscriptionRecordDto {
    @ApiProperty()
    @IsString()
    productDisplayName!: string;

    @IsString()
    @ApiProperty()
    paymentSystemTransactionId!: string;

    @IsString()
    @ApiProperty()
    paymentSystemProductId!: string;

    @IsString()
    @IsOptional()
    @ApiPropertyOptional()
    millerPaymentReferenceUuid?: string;

    @IsString()
    @ApiProperty()
    paymentSystemCustomerId!: string;

    @IsString()
    @ApiProperty()
    paymentSystemCustomerEmail!: string;

    @IsString()
    @ApiProperty()
    paymentSystemMode!: string;

    @IsString()
    @ApiProperty()
    paymentSystemName!: string;

    @IsString()
    @ApiProperty()
    internalSku!: string;

    @Transform(({value}) => new Date(value as string))
    @Type(() => Date)
    @IsDate()
    @ApiProperty({type: Date})
    validUntil!: Date;
}
