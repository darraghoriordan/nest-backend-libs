import {Injectable} from "@nestjs/common";
import {ConfigService} from "@nestjs/config";
import {IsBoolean, IsDefined, IsString} from "class-validator";
import {ValidatedConfigurationService} from "../configuration/ValidatedConfigurationService";

@Injectable()
export class LoggingConfigurationService extends ValidatedConfigurationService {
    constructor(private configService: ConfigService) {
        super();
    }

    @IsDefined()
    @IsBoolean()
    get shouldLogForDevelopment(): boolean {
        return this.configService.get<string>("logging.nodeEnv") === "dev";
    }

    @IsString()
    @IsDefined()
    get loggerName(): string {
        return (
            this.configService.get<string>("logging.loggerName") ||
            "DefaultLogger"
        );
    }
}
