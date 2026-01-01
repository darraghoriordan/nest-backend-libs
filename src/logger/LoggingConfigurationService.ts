import {Inject, Injectable} from "@nestjs/common";
import {IsBoolean, IsDefined, IsOptional, IsString} from "class-validator";
import {ValidatedConfigurationService} from "../configuration/ValidatedConfigurationService.js";
import {LOGGER_MODULE_OPTIONS, LoggerModuleOptions} from "./logger.options.js";

@Injectable()
export class LoggingConfigurationService extends ValidatedConfigurationService {
    constructor(
        @Inject(LOGGER_MODULE_OPTIONS)
        private options: LoggerModuleOptions
    ) {
        super();
    }

    @IsDefined()
    @IsBoolean()
    get shouldLogForDevelopment(): boolean {
        return this.options.nodeEnv === "dev";
    }

    @IsString()
    @IsDefined()
    get loggerName(): string {
        return this.options.loggerName ?? "DefaultLogger";
    }

    @IsString()
    @IsOptional()
    get minLevel(): string {
        return this.options.minLevel ?? "debug";
    }

    @IsBoolean()
    @IsOptional()
    get usePrettyLogs(): boolean {
        return this.options.usePrettyLogs ?? false;
    }
}
