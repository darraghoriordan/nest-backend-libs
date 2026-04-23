import {ApiProperty} from "@nestjs/swagger";

export class OrganisationSummaryDto {
    @ApiProperty()
    id!: number;

    @ApiProperty()
    uuid!: string;

    @ApiProperty()
    name!: string;
}
