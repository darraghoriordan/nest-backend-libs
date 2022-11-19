/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable unicorn/prevent-abbreviations */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {Injectable, LoggerService} from "@nestjs/common";
import {Logger} from "tslog";
import {LoggingConfigurationService} from "./LoggingConfigurationService";

@Injectable()
export default class CoreLoggerService implements LoggerService {
    private logger: Logger;

    constructor(private readonly configService: LoggingConfigurationService) {
        this.logger = new Logger({
            displayLoggerName: true,
            displayFunctionName: false,
            name: this.configService.loggerName,
            displayFilePath: "hidden",
            colorizePrettyLogs: this.configService.shouldLogForDevelopment,
        });
    }

    log(message: any, ...optionalParams: any[]) {
        this.logger.info(message, ...optionalParams);
    }

    error(message: any, ...optionalParams: any[]) {
        this.logger.error(message, ...optionalParams);
    }

    warn(message: any, ...optionalParams: any[]) {
        this.logger.warn(message, ...optionalParams);
    }

    debug(message: any, ...optionalParams: any[]) {
        this.logger.debug(message, ...optionalParams);
    }

    verbose(message: any, ...optionalParams: any[]) {
        this.logger.trace(message, ...optionalParams);
    }
}
