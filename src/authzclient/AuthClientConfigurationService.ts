import {Inject, Injectable} from "@nestjs/common";
import {IsDefined, IsString} from "class-validator";
import {ValidatedConfigurationService} from "../configuration/ValidatedConfigurationService.js";
import {
    AUTHZ_CLIENT_MODULE_OPTIONS,
    AuthzClientModuleOptions,
} from "./authz-client.options.js";

@Injectable()
export class AuthClientConfigurationService extends ValidatedConfigurationService {
    constructor(
        @Inject(AUTHZ_CLIENT_MODULE_OPTIONS)
        private options: AuthzClientModuleOptions
    ) {
        super();
    }

    @IsDefined()
    @IsString()
    get auth0Domain(): string {
        return this.options.auth0Domain;
    }

    @IsDefined()
    @IsString()
    get auth0ClientId(): string {
        return this.options.auth0ClientId;
    }
}
