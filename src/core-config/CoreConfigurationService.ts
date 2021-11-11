/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {Injectable} from "@nestjs/common";
import {ConfigService} from "@nestjs/config";
import {IsBoolean, IsDefined, IsInt, IsString} from "class-validator";
import {ValidatedConfigurationService} from "../configuration/ValidatedConfigurationService";

@Injectable()
export class CoreConfigurationService extends ValidatedConfigurationService {
    constructor(private configService: ConfigService) {
        super();
    }

    @IsDefined()
    @IsBoolean()
    get shouldGenerateSwagger(): boolean {
        return (
            this.configService.get<string>("core.shouldGenerateSwagger") ===
            "true"
        );
    }

    @IsDefined()
    @IsBoolean()
    get shouldAutomaticallyInstallApiModels(): boolean {
        return (
            this.configService.get<string>(
                "core.shouldAutomaticallyInstallApiModels"
            ) === "true"
        );
    }

    @IsDefined()
    @IsBoolean()
    get shouldUseNestCors(): boolean {
        return (
            this.configService.get<string>("core.shouldUseNestCors") === "true"
        );
    }

    @IsDefined()
    @IsInt()
    get webPort(): number {
        return Number.parseInt(
            this.configService.get<string>("core.webPort")!,
            10
        );
    }

    @IsDefined()
    @IsString()
    get clientCorsUrl(): string {
        return this.configService.get<string>("core.clientCorsUrl")!;
    }

    @IsDefined()
    @IsString()
    get appTitle(): string {
        return this.configService.get<string>("core.appTitle")!;
    }

    @IsDefined()
    @IsString()
    get appEnvironmentSpecificUrl(): string {
        return this.configService.get<string>(
            "core.appEnvironmentSpecificUrl"
        )!;
    }

    @IsDefined()
    @IsString()
    get nodeEnv(): string {
        return this.configService.get<string>("core.nodeEnv")!;
    }
}
