import {createTransport, Transporter} from "nodemailer";
import {EmailConfigurationService} from "./EmailConfigurationService";

export const EmailClientProvider = {
    provide: "SmtpEmailClient",
    useFactory: (config: EmailConfigurationService): Transporter => {
        return createTransport({
            host: config.smtpHost,
            port: config.smtpPort,
            secure: config.smtpPort === 465 ? true : false, // true for 465, false for other ports
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            auth: {
                user: config.emailUsername,
                pass: config.emailPassword,
            },
        });
    },
    inject: [EmailConfigurationService],
};
