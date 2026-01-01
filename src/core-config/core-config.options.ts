import type {ModuleMetadata} from "@nestjs/common";
import type {HelmetOptions} from "helmet";

export type {HelmetOptions} from "helmet";

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
    /**
     * Optional Helmet configuration. Passed directly to helmet().
     * If not provided, Helmet runs with default options.
     * Set to false to disable Helmet entirely (not recommended).
     * @see https://helmetjs.github.io/
     */
    helmetOptions?: HelmetOptions | false;
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
