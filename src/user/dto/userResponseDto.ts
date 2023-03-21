import {ApiProperty, ApiPropertyOptional} from "@nestjs/swagger";
import {OrganisationMembership} from "../../organisation-memberships/entities/organisation-membership.entity.js";

export class UserDto {
    @ApiPropertyOptional({
        description:
            "Is the user a super user. Only set if the user is the current user. Will not be set for list responses.",
    })
    isSuper?: boolean;

    @ApiProperty()
    id!: number;

    @ApiProperty()
    email!: string;

    @ApiProperty()
    public uuid!: string;

    @ApiProperty()
    emailVerified!: boolean;

    @ApiProperty()
    blocked!: boolean;

    @ApiPropertyOptional()
    name?: string;

    @ApiPropertyOptional()
    familyName?: string;

    @ApiPropertyOptional()
    givenName?: string;

    @ApiPropertyOptional()
    picture?: string;

    @ApiPropertyOptional()
    auth0UserId?: string;

    @ApiPropertyOptional()
    username?: string;

    @ApiProperty({type: () => OrganisationMembership, isArray: true})
    memberships!: OrganisationMembership[];

    @ApiProperty()
    createdDate!: Date;

    @ApiProperty()
    updateDate!: Date;

    @ApiPropertyOptional()
    deletedDate?: Date;
}
