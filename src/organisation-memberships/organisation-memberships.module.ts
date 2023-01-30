import {Module} from "@nestjs/common";
import {LoggerModule} from "../logger/logger.module";
import {TypeOrmModule} from "@nestjs/typeorm";
import {OrganisationMembership} from "./entities/organisation-membership.entity";
import {OrganisationMembershipsController} from "./organisation-memberships.controller";
import {OrganisationMembershipsService} from "./organisation-memberships.service";
import {Organisation} from "../organisation/entities/organisation.entity";
import {MembershipRole} from "../organisation/entities/member-role.entity";

@Module({
    imports: [
        LoggerModule,
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
