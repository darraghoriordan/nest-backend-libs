import {ApiProperty} from "@nestjs/swagger";
import {IsInt, IsString} from "class-validator";

export class StripeCheckoutLineItem {
    @ApiProperty()
    @IsString()
    price!: string;

    @ApiProperty()
    @IsInt()
    quantity!: number;
}
