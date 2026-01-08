import type {ModuleMetadata} from "@nestjs/common";

export const AUTHZ_MODULE_OPTIONS = Symbol("AUTHZ_MODULE_OPTIONS");

export interface AuthzModuleOptions {
    auth0Audience: string;
    auth0Domain: string;
    superUserIds: string[];
}

export interface AuthzModuleAsyncOptions extends Pick<
    ModuleMetadata,
    "imports"
> {
    useFactory: (
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ...arguments_: any[]
    ) => Promise<AuthzModuleOptions> | AuthzModuleOptions;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    inject?: any[];
    isGlobal?: boolean;
}
