import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {OrganisationMembership} from "./entities/organisation-membership.entity";
import {OrganisationMembershipsController} from "./organisation-memberships.controller";
import {OrganisationMembershipsService} from "./organisation-memberships.service";
import {Organisation} from "../organisation/entities/organisation.entity";
import {MembershipRole} from "../organisation/entities/member-role.entity";

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Organisation,
            OrganisationMembership,
            MembershipRole,
        ]),
    ],
    controllers: [OrganisationMembershipsController],
    providers: [OrganisationMembershipsService],
    exports: [OrganisationMembershipsService],
})
export class OrganisationMembershipsModule {}
