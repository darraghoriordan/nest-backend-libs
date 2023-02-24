import {ApiProperty, ApiPropertyOptional} from "@nestjs/swagger";
import {Column} from "typeorm";
import {OrganisationMembership} from "../../organisation-memberships/entities/organisation-membership.entity";

export class PersonDto {
    @ApiProperty()
    isSuper!: boolean;

    @ApiProperty()
    id!: number;

    @ApiProperty()
    email!: string;

    @ApiProperty()
    public uuid!: string;

    @ApiProperty()
    emailVerified!: boolean;

    @ApiProperty()
    @Column({default: false})
    blocked!: boolean;

    @ApiPropertyOptional()
    name?: string;

    @ApiPropertyOptional()
    familyName?: string;

    @ApiPropertyOptional()
    givenName?: string;

    @ApiProperty()
    picture!: string;

    @ApiProperty()
    auth0UserId!: string;

    @ApiPropertyOptional()
    username?: string;

    @ApiProperty({type: () => OrganisationMembership, isArray: true})
    memberships!: OrganisationMembership[];

    @ApiProperty()
    createdDate!: Date;

    @ApiProperty()
    updateDate!: Date;

    @ApiProperty()
    deletedDate!: Date;
}
