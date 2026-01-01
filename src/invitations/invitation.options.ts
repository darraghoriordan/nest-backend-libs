import type {ModuleMetadata} from "@nestjs/common";

export const INVITATION_MODULE_OPTIONS = Symbol("INVITATION_MODULE_OPTIONS");

export interface InvitationModuleOptions {
    baseUrl: string;
}

export interface InvitationModuleAsyncOptions extends Pick<
    ModuleMetadata,
    "imports"
> {
    useFactory: (
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ...args: any[]
    ) => Promise<InvitationModuleOptions> | InvitationModuleOptions;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    inject?: any[];
    isGlobal?: boolean;
}
