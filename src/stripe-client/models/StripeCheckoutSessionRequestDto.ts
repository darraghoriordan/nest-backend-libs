// this just exists to avoid having to import the stripe lib directly
// not sure if a great idea but let's see!

import {ApiProperty, ApiPropertyOptional} from "@nestjs/swagger";
import {Type} from "class-transformer";
import {
    IsArray,
    IsIn,
    IsOptional,
    IsString,
    ValidateNested,
} from "class-validator";
import {StripeCheckoutLineItem} from "./StripeCheckoutLineItem.js";

export class StripeCheckoutSessionRequestDto {
    @ApiPropertyOptional()
    @IsOptional()
    organisationId?: string;

    @ApiProperty({isArray: true, type: StripeCheckoutLineItem})
    @IsArray()
    @ValidateNested({each: true})
    @Type(() => StripeCheckoutLineItem)
    lineItems!: StripeCheckoutLineItem[];

    // eslint-disable-next-line @darraghor/nestjs-typed/validated-non-primitive-property-needs-type-decorator
    @ApiProperty({type: String})
    @IsIn(["subscription", "payment", "setup"])
    mode!: "subscription" | "payment" | "setup";

    @ApiProperty({
        description:
            "The URL to which Stripe should redirect the customer after payment. This is appended to the host configured in the StripeClientConfigurationService",
    })
    @IsString()
    successFrontendPath!: string;

    @ApiPropertyOptional({
        description:
            "The URL to which Stripe should redirect the customer after payment cancellation. This is appended to the host configured in the StripeClientConfigurationService",
    })
    @IsOptional()
    cancelFrontendPath?: string;
}
