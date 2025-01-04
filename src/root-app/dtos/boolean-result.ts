import {ApiProperty} from "@nestjs/swagger";

export class BooleanResult {
    @ApiProperty()
    result!: boolean;
}
