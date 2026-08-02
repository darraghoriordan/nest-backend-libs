import {Inject, Injectable} from "@nestjs/common";
import {
    BETTER_AUTHZ_MODULE_OPTIONS,
    type BetterAuthzModuleOptions,
} from "../better-authz.options.js";
import type {AuthenticatedUserProfileResolver} from "../models/AuthenticatedUserProfile.js";

@Injectable()
export class BetterAuthConfigurationService {
    constructor(
        @Inject(BETTER_AUTHZ_MODULE_OPTIONS)
        private readonly options: BetterAuthzModuleOptions
    ) {}

    get resolveUser(): AuthenticatedUserProfileResolver {
        return this.options.resolveUser;
    }

    get superUserIds(): string[] {
        return this.options.superUserIds ?? [];
    }
}
