import type {ModuleMetadata} from "@nestjs/common";

export const SMTP_EMAIL_MODULE_OPTIONS = Symbol("SMTP_EMAIL_MODULE_OPTIONS");

export interface SmtpEmailModuleOptions {
    smtpHost: string;
    smtpPort: number;
    emailUsername: string;
    emailPassword: string;
    senderEmailAddress: string;
    senderName: string;
    extraEmailBcc: string;
    isEmailSyncSendEnabled: boolean;
}

export interface SmtpEmailModuleAsyncOptions extends Pick<
    ModuleMetadata,
    "imports"
> {
    useFactory: (
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ...args: any[]
    ) => Promise<SmtpEmailModuleOptions> | SmtpEmailModuleOptions;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    inject?: any[];
    isGlobal?: boolean;
}
