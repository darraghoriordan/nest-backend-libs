import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {OrganisationMembership} from "./entities/organisation-membership.entity.js";
import {OrganisationMembershipsController} from "./organisation-memberships.controller.js";
import {OrganisationMembershipsService} from "./organisation-memberships.service.js";
import {Organisation} from "../organisation/entities/organisation.entity.js";
import {MembershipRole} from "../organisation/entities/member-role.entity.js";
import {Invitation} from "../invitations/entities/invitation.entity.js";

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Organisation,
            OrganisationMembership,
            MembershipRole,
            Invitation,
        ]),
    ],
    controllers: [OrganisationMembershipsController],
    providers: [OrganisationMembershipsService],
    exports: [OrganisationMembershipsService],
})
export class OrganisationMembershipsModule {}
