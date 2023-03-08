import {ApiProperty} from "@nestjs/swagger";

export class CreateUpdateMembershipDto {
    @ApiProperty()
    userId!: number;

    @ApiProperty({type: String, isArray: true})
    roles!: string[];
}
