import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {Invitation} from "./entities/invitation.entity";
import {InvitationController} from "./invitation.controller";
import {InvitationService} from "./invitation.service";
import {SmtpEmailClientModule} from "../smtp-email-client/smtp-email-client.module";
import {OrganisationModule} from "../organisation/organisation.module";
import {ConfigModule} from "@nestjs/config";
import configVariables from "./InvitationConfigurationVariables";
import {InvitationsConfigurationService} from "./InvitationConfigurationService";
import {Organisation} from "../organisation/entities/organisation.entity";

@Module({
    imports: [
        ConfigModule.forFeature(configVariables),
        TypeOrmModule.forFeature([Invitation, Organisation]),
        SmtpEmailClientModule,
        OrganisationModule,
    ],
    controllers: [InvitationController],
    providers: [InvitationService, InvitationsConfigurationService],
    exports: [InvitationService],
})
export class InvitationModule {}
