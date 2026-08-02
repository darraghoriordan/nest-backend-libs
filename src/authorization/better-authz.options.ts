import type {ModuleMetadata} from "@nestjs/common";
import type {AuthenticatedUserProfileResolver} from "./models/AuthenticatedUserProfile.js";

export const BETTER_AUTHZ_MODULE_OPTIONS = Symbol(
    "BETTER_AUTHZ_MODULE_OPTIONS"
);

export interface BetterAuthzModuleOptions {
    resolveUser: AuthenticatedUserProfileResolver;
    superUserIds?: string[];
}

export interface BetterAuthzModuleAsyncOptions extends Pick<
    ModuleMetadata,
    "imports"
> {
    useFactory: (
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ...arguments_: any[]
    ) => Promise<BetterAuthzModuleOptions> | BetterAuthzModuleOptions;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    inject?: any[];
    isGlobal?: boolean;
}
