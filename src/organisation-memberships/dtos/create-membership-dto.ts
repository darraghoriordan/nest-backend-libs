import {ApiProperty} from "@nestjs/swagger";

export class CreateUpdateMembershipDto {
    @ApiProperty()
    personId!: number;

    @ApiProperty({type: String, isArray: true})
    roles!: string[];
}
