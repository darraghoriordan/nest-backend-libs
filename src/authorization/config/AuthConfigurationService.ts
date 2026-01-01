import {Inject, Injectable} from "@nestjs/common";
import {IsArray, IsDefined, IsString} from "class-validator";
import {ValidatedConfigurationService} from "../../configuration/ValidatedConfigurationService.js";
import {AUTHZ_MODULE_OPTIONS, AuthzModuleOptions} from "../authz.options.js";

@Injectable()
export class AuthConfigurationService extends ValidatedConfigurationService {
    constructor(
        @Inject(AUTHZ_MODULE_OPTIONS)
        private options: AuthzModuleOptions
    ) {
        super();
    }

    @IsDefined()
    @IsString()
    get auth0Audience(): string {
        return this.options.auth0Audience;
    }

    @IsDefined()
    @IsString()
    get auth0Domain(): string {
        return this.options.auth0Domain;
    }

    @IsDefined()
    @IsArray()
    get superUserIds(): string[] {
        return this.options.superUserIds;
    }
}
