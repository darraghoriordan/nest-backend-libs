import {InjectQueue} from "@nestjs/bullmq";
import {Inject, Injectable, Logger} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {Queue} from "bullmq";
import {Transporter} from "nodemailer";
import {Repository} from "typeorm";
import {Email} from "./email.entity.js";
import {EmailConfigurationService} from "./EmailConfigurationService.js";

@Injectable()
export class SmtpEmailClient {
    private readonly logger = new Logger(SmtpEmailClient.name);
    constructor(
        @InjectRepository(Email)
        private emailRepository: Repository<Email>,
        @Inject("SmtpEmailTransporter")
        private smtpEmailTransporter: Transporter,
        @InjectQueue("smtp-emails")
        private queue: Queue,
        private config: EmailConfigurationService
    ) {}

    public async verify() {
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
        const serialisedToEmailAddresses = to.join(",");
        const serialisedBccEmailAddresses = [
            ...bccTo,
            this.config.extraEmailBcc,
        ].join(",");
        const email = this.emailRepository.create();

        email.htmlBody = htmlBody;

        email.textBody = plainTextBody;
        email.bccTo = serialisedBccEmailAddresses;
        email.to = serialisedToEmailAddresses;
        email.subject = subject;
        email.ownerId = sendingUserId;
        this.logger.log(
            `Saving email to queue. Email ownerId: ${email.ownerId}`
        );
        await this.queue.add("send-email", email);
    }
}
