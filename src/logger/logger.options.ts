import type {ModuleMetadata} from "@nestjs/common";

export const LOGGER_MODULE_OPTIONS = Symbol("LOGGER_MODULE_OPTIONS");

export interface LoggerModuleOptions {
    nodeEnv: string;
    loggerName?: string;
    minLevel?: string;
    usePrettyLogs?: boolean;
}

export interface LoggerModuleAsyncOptions extends Pick<
    ModuleMetadata,
    "imports"
> {
    useFactory: (
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ...arguments_: any[]
    ) => Promise<LoggerModuleOptions> | LoggerModuleOptions;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    inject?: any[];
    isGlobal?: boolean;
}
