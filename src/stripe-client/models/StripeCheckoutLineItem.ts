import {ApiProperty} from "@nestjs/swagger";

export class StripeCheckoutLineItem {
    @ApiProperty()
    price!: string;
    @ApiProperty()
    quantity!: number;
}
