import {Module} from "@nestjs/common";
import {OrganisationService} from "./organisation.service.js";
import {OrganisationController} from "./organisation.controller.js";
import {TypeOrmModule} from "@nestjs/typeorm";
import {Organisation} from "./entities/organisation.entity.js";
import {MembershipRole} from "./entities/member-role.entity.js";
import {OrganisationMembership} from "../organisation-memberships/entities/organisation-membership.entity.js";
import {OrganisationMembershipsModule} from "../organisation-memberships/organisation-memberships.module.js";

@Module({
    imports: [
        OrganisationMembershipsModule,
        TypeOrmModule.forFeature([
            Organisation,
            OrganisationMembership,
            MembershipRole,
        ]),
    ],
    controllers: [OrganisationController],
    providers: [OrganisationService],
    exports: [OrganisationService],
})
export class OrganisationModule {}
