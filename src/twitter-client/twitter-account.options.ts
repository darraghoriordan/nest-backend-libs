import type {ModuleMetadata} from "@nestjs/common";

export const TWITTER_MODULE_OPTIONS = Symbol("TWITTER_MODULE_OPTIONS");

export interface TwitterModuleOptions {
    appKey: string;
    appSecret: string;
    accessToken: string;
    accessSecret: string;
}

export interface TwitterModuleAsyncOptions extends Pick<
    ModuleMetadata,
    "imports"
> {
    useFactory: (
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ...args: any[]
    ) => Promise<TwitterModuleOptions> | TwitterModuleOptions;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    inject?: any[];
    isGlobal?: boolean;
}
