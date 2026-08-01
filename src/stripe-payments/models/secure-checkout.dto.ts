import {ApiProperty, ApiPropertyOptional} from "@nestjs/swagger";
import {Type} from "class-transformer";
import {
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
    IsUUID,
    Matches,
    Max,
    MaxLength,
    Min,
} from "class-validator";

const relativePathPattern = /^\/(?!\/)[^\s]*$/;

export class StripeCheckoutSessionRequestDto {
    @ApiProperty()
    @IsUUID("4")
    organisationUuid!: string;

    @ApiProperty({
        description:
            "A product key from the server-side Stripe product catalog",
    })
    @IsString()
    @IsNotEmpty()
    @Matches(/^[a-z0-9][a-z0-9_-]{0,63}$/)
    productKey!: string;

    @ApiProperty({
        description:
            "A relative frontend path on the configured application origin",
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(200)
    @Matches(relativePathPattern)
    successFrontendPath!: string;

    @ApiPropertyOptional({
        description:
            "A relative frontend path on the configured application origin",
    })
    @IsOptional()
    @IsString()
    @MaxLength(200)
    @Matches(relativePathPattern)
    cancelFrontendPath?: string;
}

export class StripeCustomerPortalRequestDto {
    @ApiProperty()
    @IsUUID("4")
    subscriptionRecordUuid!: string;

    @ApiProperty({
        description:
            "A relative frontend path on the configured application origin",
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(200)
    @Matches(relativePathPattern)
    returnUrl!: string;
}

export class StripeEventsQueryDto {
    @ApiPropertyOptional({
        type: Number,
        default: 0,
        minimum: 0,
        maximum: 1000,
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(0)
    @Max(1000)
    skip = 0;

    @ApiPropertyOptional({
        type: Number,
        default: 50,
        minimum: 1,
        maximum: 1000,
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(1000)
    take = 50;
}
