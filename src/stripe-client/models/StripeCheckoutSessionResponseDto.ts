import {ApiProperty} from "@nestjs/swagger";

export class StripeCheckoutSessionResponseDto {
    @ApiProperty()
    stripeSessionId!: string;

    @ApiProperty()
    stripeSessionUrl!: string;
}
