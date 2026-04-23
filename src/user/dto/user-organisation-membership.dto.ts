import {ApiProperty, ApiPropertyOptional} from "@nestjs/swagger";
import {MembershipRole} from "../../organisation/entities/member-role.entity.js";
import {OrganisationSummaryDto} from "./organisation-summary.dto.js";

export class UserOrganisationMembershipDto {
    @ApiProperty()
    id!: number;

    @ApiProperty()
    uuid!: string;

    @ApiProperty()
    userId!: number;

    @ApiProperty({type: () => OrganisationSummaryDto})
    organisation!: OrganisationSummaryDto;

    @ApiProperty()
    organisationId!: number;

    @ApiPropertyOptional({type: () => MembershipRole, isArray: true})
    roles?: MembershipRole[];

    @ApiProperty()
    createdDate!: Date;

    @ApiPropertyOptional()
    deletedDate?: Date;

    @ApiProperty()
    updateDate!: Date;
}
