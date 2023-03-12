/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {Injectable} from "@nestjs/common";
import {ConfigService} from "@nestjs/config";
import {IsBoolean, IsDefined, IsInt, IsString} from "class-validator";
import {ValidatedConfigurationService} from "../configuration/ValidatedConfigurationService.js";

@Injectable()
export class EmailConfigurationService extends ValidatedConfigurationService {
    constructor(private configService: ConfigService) {
        super();
    }

    @IsDefined()
    @IsBoolean()
    get isEmailSyncSendEnabled(): boolean {
        return (
            this.configService.get<string>("email.isEmailSyncSendEnabled") ===
            "true"
        );
    }

    @IsDefined()
    @IsString()
    get extraEmailBcc(): string {
        return this.configService.get<string>("email.extraEmailBcc")!;
    }

    @IsDefined()
    @IsString()
    get emailPassword(): string {
        return this.configService.get<string>("email.smtpPassword")!;
    }

    @IsDefined()
    @IsString()
    get smtpHost(): string {
        return this.configService.get<string>("email.smtpHost")!;
    }

    @IsDefined()
    @IsInt()
    get smtpPort(): number {
        return Number.parseInt(
            this.configService.get<string>("email.smtpPort")!,
            10
        );
    }

    @IsDefined()
    @IsString()
    get emailUsername(): string {
        return this.configService.get<string>("email.smtpUsername")!;
    }

    @IsDefined()
    @IsString()
    get senderEmailAddress(): string {
        return this.configService.get<string>("email.senderEmailAddress")!;
    }

    @IsDefined()
    @IsString()
    get senderName(): string {
        return this.configService.get<string>("email.senderName")!;
    }
}
