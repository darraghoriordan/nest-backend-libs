import {ApiProperty} from "@nestjs/swagger";

export class StripeCustomerPortalResponseDto {
    @ApiProperty()
    public sessionUrl!: string;
}
