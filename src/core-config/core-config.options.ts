import type {ModuleMetadata} from "@nestjs/common";

export const CORE_MODULE_OPTIONS = Symbol("CORE_MODULE_OPTIONS");

export interface CoreModuleOptions {
    webPort: number;
    appTitle: string;
    frontEndAppUrl: string;
    nodeEnv: string;
    bullQueueHost: string;
    shouldGenerateSwagger: boolean;
    shouldAutomaticallyInstallApiModels: boolean;
    shouldUseNestCors: boolean;
    globalPrefix?: string;
}

export interface CoreModuleAsyncOptions extends Pick<
    ModuleMetadata,
    "imports"
> {
    useFactory: (
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ...args: any[]
    ) => Promise<CoreModuleOptions> | CoreModuleOptions;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    inject?: any[];
    isGlobal?: boolean;
}
