import {InjectQueue} from "@nestjs/bull";
import {Inject, Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {Queue} from "bull";
import {Transporter} from "nodemailer";
import {Repository} from "typeorm";
import CoreLoggerService from "../logger/CoreLoggerService";
import {Email} from "./email.entity";
import {EmailConfigurationService} from "./EmailConfigurationService";
import {queueName} from "./smtp-email-client.module";

@Injectable()
export class SmtpEmailClient {
    constructor(
        private logger: CoreLoggerService,
        @InjectRepository(Email)
        private emailRepository: Repository<Email>,
        @Inject("SmtpEmailClient")
        private smtpEmailTransporter: Transporter,
        @InjectQueue(queueName) private queue: Queue,
        private config: EmailConfigurationService
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
        const serialisedToEmailAddresses = to.join(",");
        const serialisedBccEmailAddresses = [
            ...bccTo,
            this.config.extraEmailBcc,
        ].join(",");
        const email = this.emailRepository.create();

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        email.htmlBody = htmlBody;
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        email.textBody = plainTextBody;
        email.bccTo = serialisedBccEmailAddresses;
        email.to = serialisedToEmailAddresses;
        email.subject = subject;
        email.ownerId = sendingUserId;
        this.logger.log(
            `Saving email to queue. Email ownerId: ${email.ownerId}`
        );
        await this.queue.add(email);
    }
}
