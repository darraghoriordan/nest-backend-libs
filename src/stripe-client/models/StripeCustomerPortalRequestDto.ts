import {ApiProperty} from "@nestjs/swagger";
import {IsDefined, IsString} from "class-validator";

export class StripeCustomerPortalRequestDto {
    @ApiProperty()
    @IsString()
    @IsDefined()
    public subscriptionRecordUuid!: string;

    @ApiProperty()
    @IsString()
    @IsDefined()
    public returnUrl!: string;
}
