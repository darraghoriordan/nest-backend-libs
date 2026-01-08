import {Processor, OnWorkerEvent, WorkerHost} from "@nestjs/bullmq";
import {Inject, Injectable, Logger} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {Job} from "bullmq";
import {Transporter} from "nodemailer";
import Mail from "nodemailer/lib/mailer";
import {Repository} from "typeorm";
import {Email} from "./email.entity.js";
import {EmailConfigurationService} from "./EmailConfigurationService.js";

@Injectable()
@Processor("smtp-emails")
export class SmtpEmailHandler extends WorkerHost {
    private readonly logger = new Logger(SmtpEmailHandler.name);
    constructor(
        private config: EmailConfigurationService,
        @InjectRepository(Email)
        private emailRepository: Repository<Email>,
        @Inject("SmtpEmailTransporter")
        private smtpEmailTransporter: Transporter
    ) {
        super();
    }

    @OnWorkerEvent("failed")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError(job: Job<Email>, error: any) {
        this.logger.error(
            `Failed job ${job.id} of type ${job.name}: ${error.message as string}`,

            error.stack
        );
    }

    @OnWorkerEvent("active")
    onActive(job: Job<Email>) {
        this.logger.log(`Active job ${job.id} of type ${job.name}`, job.data);
    }

    @OnWorkerEvent("completed")
    onComplete(job: Job<Email>) {
        this.logger.log(
            `Completed job ${job.id} of type ${job.name}`,
            job.data
        );
    }

    public async process(job: Job<Email>): Promise<void> {
        const emailData = job.data;

        const savedEmail = await this.emailRepository.save(emailData);

        if (!this.config.isEmailSyncSendEnabled) {
            this.logger.log(
                `Email saved but not sent because email is disabled. Email id: ${savedEmail.id}`
            );
            return;
        }

        this.logger.log(`Sending an email. Email id: ${savedEmail.id}`);

        const sendEmailBody = {
            from: `"${this.config.senderName}" <${this.config.senderEmailAddress}>`,
            to: emailData.to,
            subject: emailData.subject,
            bcc: emailData.bccTo,
        } as Mail.Options;
        if (emailData.htmlBody) {
            sendEmailBody.html = emailData.htmlBody;
        }
        if (emailData.textBody) {
            sendEmailBody.text = emailData.textBody;
        }
         
        const info = await this.smtpEmailTransporter.sendMail(sendEmailBody);

        emailData.sentDate = new Date();
        await this.emailRepository.save(emailData);
        this.logger.log(info);
    }
}
