import {registerAs} from "@nestjs/config";

export default registerAs("email", () => ({
    extraEmailBcc: process.env.EXTRA_EMAIL_BCC,
    senderName: process.env.EMAIL_SENDER_NAME,
    senderEmailAddress: process.env.EMAIL_SENDER_ADDRESS,
    isEmailSyncSendEnabled: process.env.EMAIL_SYNC_SEND_ENABLED,
    smtpPassword: process.env.SMTP_EMAIL_PASSWORD,
    smtpUsername: process.env.SMTP_EMAIL_USERNAME,
    smtpHost: process.env.SMTP_EMAIL_HOST,
    smtpPort: process.env.SMTP_EMAIL_PORT,
}));
