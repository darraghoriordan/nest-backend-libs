import {Inject, Injectable} from "@nestjs/common";
import {IsDefined, IsString} from "class-validator";
import {ValidatedConfigurationService} from "../configuration/ValidatedConfigurationService.js";
import {
    INVITATION_MODULE_OPTIONS,
    InvitationModuleOptions,
} from "./invitation.options.js";

@Injectable()
export class InvitationsConfigurationService extends ValidatedConfigurationService {
    constructor(
        @Inject(INVITATION_MODULE_OPTIONS)
        private options: InvitationModuleOptions
    ) {
        super();
    }

    @IsDefined()
    @IsString()
    get baseUrl(): string {
        return this.options.baseUrl;
    }
}
