import {ApiProperty} from "@nestjs/swagger";

export class CreateInvitationDto {
    @ApiProperty()
    givenName!: string;

    @ApiProperty()
    emailAddress!: string;

    @ApiProperty()
    organisationId!: number;
}
