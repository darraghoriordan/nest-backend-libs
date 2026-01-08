// this just exists to avoid having to import the stripe lib directly
// not sure if a great idea but let's see!

import {ApiProperty, ApiPropertyOptional} from "@nestjs/swagger";
import {Type} from "class-transformer";
import {
    IsArray,
    IsIn,
    IsOptional,
    IsString,
    IsUUID,
    ValidateNested,
} from "class-validator";
import {StripeCheckoutLineItem} from "./StripeCheckoutLineItem.js";

export class StripeCheckoutSessionRequestDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsUUID("4")
    organisationUuid?: string;

    @ApiProperty({isArray: true, type: StripeCheckoutLineItem})
    @IsArray()
    @ValidateNested({each: true})
    @Type(() => StripeCheckoutLineItem)
    lineItems!: StripeCheckoutLineItem[];

     
    @ApiProperty({type: String})
    @IsIn(["subscription", "payment", "setup"])
    mode!: "subscription" | "payment" | "setup";

    @ApiProperty({
        description:
            "The path on frontend to which Stripe should redirect the customer after payment. This is appended to the host configured in the StripeClientConfigurationService",
    })
    @IsString()
    successFrontendPath!: string;

    @ApiPropertyOptional({
        description:
            "The path on frontend to which Stripe should redirect the customer after payment cancellation. This is appended to the host configured in the StripeClientConfigurationService",
    })
    @IsOptional()
    cancelFrontendPath?: string;
}
