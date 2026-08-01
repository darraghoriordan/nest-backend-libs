import {ApiProperty} from "@nestjs/swagger";

export class StripeCheckoutSessionResponseDto {
    @ApiProperty()
    stripeSessionId!: string;

    @ApiProperty()
    stripeSessionUrl!: string;
}

export class StripeCustomerPortalResponseDto {
    @ApiProperty()
    sessionUrl!: string;
}
