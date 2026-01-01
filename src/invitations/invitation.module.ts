import {DynamicModule, Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {Invitation} from "./entities/invitation.entity.js";
import {InvitationController} from "./invitation.controller.js";
import {InvitationService} from "./invitation.service.js";
import {OrganisationModule} from "../organisation/organisation.module.js";
import {InvitationsConfigurationService} from "./InvitationConfigurationService.js";
import {OrganisationMembership} from "../organisation-memberships/entities/organisation-membership.entity.js";
import {User} from "../user/entities/user.entity.js";
import {
    INVITATION_MODULE_OPTIONS,
    InvitationModuleAsyncOptions,
} from "./invitation.options.js";

@Module({})
export class InvitationModule {
    static forRoot(): never {
        throw new Error(
            "InvitationModule.forRoot() is not supported. Use forRootAsync() instead."
        );
    }

    static forRootAsync(options: InvitationModuleAsyncOptions): DynamicModule {
        return {
            module: InvitationModule,
            global: options.isGlobal ?? false,
            imports: [
                ...(options.imports || []),
                OrganisationModule,
                TypeOrmModule.forFeature([
                    OrganisationMembership,
                    User,
                    Invitation,
                ]),
            ],
            controllers: [InvitationController],
            providers: [
                {
                    provide: INVITATION_MODULE_OPTIONS,
                    useFactory: options.useFactory,
                    inject: options.inject || [],
                },
                InvitationsConfigurationService,
                InvitationService,
            ],
            exports: [InvitationService],
        };
    }
}
