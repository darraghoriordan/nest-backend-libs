import {Inject, Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {Transporter} from "nodemailer";
import {Repository} from "typeorm";
import CoreLoggerService from "../logger/CoreLoggerService";
import {Email} from "./email.entity";
import {EmailConfigurationService} from "./EmailConfigurationService";

@Injectable()
export class SmtpEmailClient {
    constructor(
        private logger: CoreLoggerService,
        @InjectRepository(Email)
        private emailRepository: Repository<Email>,
        private config: EmailConfigurationService,
        @Inject("SmtpEmailClient")
        private smtpEmailTransporter: Transporter
    ) {}

    public async verify() {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call
        await this.smtpEmailTransporter.verify();
    }

    public async sendMail(
        to: string[],
        bccTo: string[],
        subject: string,
        sendingUserId: string,
        plainTextBody?: string,
        htmlBody?: string
    ) {
        if (!plainTextBody && !htmlBody) {
            throw new Error(
                "You must provide either html or plain text body for email"
            );
        }
        const serialisedEmailAddresses = to.join(",");
        const email = this.emailRepository.create();

        // one of these must be present based on the guard above
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        email.body = plainTextBody! || htmlBody!;

        email.to = serialisedEmailAddresses;
        email.subject = subject;
        email.ownerId = sendingUserId;

        const savedEmail = await this.emailRepository.save(email);
        if (!this.config.isEmailSyncSendEnabled) {
            this.logger.log(
                `Email saved but not sent because email is disabled. Email id: ${savedEmail.id}`
            );
            return;
        }

        this.logger.log(`Sending an email. Email id: ${savedEmail.id}`);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument
        const info = await this.smtpEmailTransporter.sendMail({
            from: `"${this.config.senderName}" <${this.config.senderEmailAddress}>`, // sender address
            to: serialisedEmailAddresses, // list of receivers
            subject: subject, // Subject line
            text: plainTextBody, // plain text body
            html: htmlBody,
        } as any);

        email.sentDate = new Date();
        await this.emailRepository.save(email);
        this.logger.log(info);
    }
}
