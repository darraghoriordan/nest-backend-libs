import {Inject, Injectable} from "@nestjs/common";
import {
    IsBoolean,
    IsDefined,
    IsInt,
    IsOptional,
    IsString,
} from "class-validator";
import {ValidatedConfigurationService} from "../configuration/ValidatedConfigurationService.js";
import {
    CORE_MODULE_OPTIONS,
    CoreModuleOptions,
    HelmetOptions,
} from "./core-config.options.js";

@Injectable()
export class CoreConfigurationService extends ValidatedConfigurationService {
    constructor(
        @Inject(CORE_MODULE_OPTIONS)
        private options: CoreModuleOptions
    ) {
        super();
    }

    @IsDefined()
    @IsBoolean()
    get shouldGenerateSwagger(): boolean {
        return this.options.shouldGenerateSwagger;
    }

    @IsDefined()
    @IsBoolean()
    get shouldAutomaticallyInstallApiModels(): boolean {
        return this.options.shouldAutomaticallyInstallApiModels;
    }

    @IsDefined()
    @IsBoolean()
    get shouldUseNestCors(): boolean {
        return this.options.shouldUseNestCors;
    }

    @IsDefined()
    @IsInt()
    get webPort(): number {
        return this.options.webPort;
    }

    @IsDefined()
    @IsString()
    get appTitle(): string {
        return this.options.appTitle;
    }

    @IsDefined()
    @IsString()
    get frontEndAppUrl(): string {
        return this.options.frontEndAppUrl;
    }

    @IsDefined()
    @IsString()
    get nodeEnv(): string {
        return this.options.nodeEnv;
    }

    @IsDefined()
    @IsString()
    get bullQueueHost(): string {
        return this.options.bullQueueHost;
    }

    @IsString()
    @IsOptional()
    get globalPrefix(): string | undefined {
        const raw = this.options.globalPrefix;
        if (!raw) {
            return undefined;
        }
        // Normalize: remove leading/trailing slashes
        return raw.replace(/^\/+|\/+$/g, "");
    }

    get helmetOptions(): HelmetOptions | false | undefined {
        return this.options.helmetOptions;
    }
}
