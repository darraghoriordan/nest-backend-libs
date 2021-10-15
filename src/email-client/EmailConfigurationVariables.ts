import {registerAs} from "@nestjs/config";

export default registerAs("email", () => ({
    isEmailSyncSendEnabled: process.env.EMAIL_SYNC_SEND_ENABLED,
    emailBcc: process.env.EMAIL_BCC,
    emailPassword: process.env.EMAIL_PASSWORD,
    emailUsername: process.env.EMAIL_USERNAME,
    senderEmailAddress: process.env.EMAIL_SENDER_ADDRESS,
}));
