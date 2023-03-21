import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {Invitation} from "./entities/invitation.entity.js";
import {InvitationController} from "./invitation.controller.js";
import {InvitationService} from "./invitation.service.js";
import {SmtpEmailClientModule} from "../smtp-email-client/smtp-email-client.module.js";
import {OrganisationModule} from "../organisation/organisation.module.js";
import {ConfigModule} from "@nestjs/config";
import configVariables from "./InvitationConfigurationVariables.js";
import {InvitationsConfigurationService} from "./InvitationConfigurationService.js";
import {OrganisationMembership} from "../organisation-memberships/entities/organisation-membership.entity.js";
import {User} from "../user/entities/user.entity.js";

@Module({
    imports: [
        ConfigModule.forFeature(configVariables),
        TypeOrmModule.forFeature([OrganisationMembership, User, Invitation]),
        SmtpEmailClientModule,
        OrganisationModule,
    ],
    controllers: [InvitationController],
    providers: [InvitationService, InvitationsConfigurationService],
    exports: [InvitationService],
})
export class InvitationModule {}
