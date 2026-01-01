import {Inject, Injectable} from "@nestjs/common";
import {IsBoolean, IsDefined, IsInt, IsString} from "class-validator";
import {ValidatedConfigurationService} from "../configuration/ValidatedConfigurationService.js";
import {
    SMTP_EMAIL_MODULE_OPTIONS,
    SmtpEmailModuleOptions,
} from "./smtp-email-client.options.js";

@Injectable()
export class EmailConfigurationService extends ValidatedConfigurationService {
    constructor(
        @Inject(SMTP_EMAIL_MODULE_OPTIONS)
        private options: SmtpEmailModuleOptions
    ) {
        super();
    }

    @IsDefined()
    @IsBoolean()
    get isEmailSyncSendEnabled(): boolean {
        return this.options.isEmailSyncSendEnabled;
    }

    @IsDefined()
    @IsString()
    get extraEmailBcc(): string {
        return this.options.extraEmailBcc;
    }

    @IsDefined()
    @IsString()
    get emailPassword(): string {
        return this.options.emailPassword;
    }

    @IsDefined()
    @IsString()
    get smtpHost(): string {
        return this.options.smtpHost;
    }

    @IsDefined()
    @IsInt()
    get smtpPort(): number {
        return this.options.smtpPort;
    }

    @IsDefined()
    @IsString()
    get emailUsername(): string {
        return this.options.emailUsername;
    }

    @IsDefined()
    @IsString()
    get senderEmailAddress(): string {
        return this.options.senderEmailAddress;
    }

    @IsDefined()
    @IsString()
    get senderName(): string {
        return this.options.senderName;
    }
}
