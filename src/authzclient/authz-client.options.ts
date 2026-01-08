import type {ModuleMetadata} from "@nestjs/common";

export const AUTHZ_CLIENT_MODULE_OPTIONS = Symbol(
    "AUTHZ_CLIENT_MODULE_OPTIONS"
);

export interface AuthzClientModuleOptions {
    auth0Domain: string;
    auth0ClientId: string;
}

export interface AuthzClientModuleAsyncOptions extends Pick<
    ModuleMetadata,
    "imports"
> {
    useFactory: (
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ...arguments_: any[]
    ) => Promise<AuthzClientModuleOptions> | AuthzClientModuleOptions;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    inject?: any[];
    isGlobal?: boolean;
}
