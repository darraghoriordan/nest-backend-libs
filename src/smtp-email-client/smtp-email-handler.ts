import {
    Processor,
    OnQueueFailed,
    OnQueueActive,
    OnQueueCompleted,
    Process,
} from "@nestjs/bull";
import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {Job} from "bull";
import {Transporter} from "nodemailer";
import Mail from "nodemailer/lib/mailer";
import {Repository} from "typeorm";
import CoreLoggerService from "../logger/CoreLoggerService";
import {Email} from "./email.entity";
import {EmailConfigurationService} from "./EmailConfigurationService";

@Injectable()
@Processor("smtp-emails")
export class SmtpEmailHandler {
    constructor(
        private config: EmailConfigurationService,
        @InjectRepository(Email)
        private emailRepository: Repository<Email>,
        private smtpEmailTransporter: Transporter,
        private readonly logger: CoreLoggerService
    ) {}

    @OnQueueFailed()
    onError(job: Job<Email>, error: any) {
        this.logger.error(
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions, @typescript-eslint/no-unnecessary-type-assertion, @typescript-eslint/no-unsafe-member-access
            `Failed job ${job.id} of type ${job.name}: ${error.message as any}`,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            error.stack
        );
    }

    @OnQueueActive()
    // eslint-disable-next-line sonarjs/no-identical-functions
    onActive(job: Job<Email>) {
        this.logger.log(`Active job ${job.id} of type ${job.name}`, job.data);
    }

    @OnQueueCompleted()
    // eslint-disable-next-line sonarjs/no-identical-functions
    onComplete(job: Job<Email>) {
        this.logger.log(
            `Completed job ${job.id} of type ${job.name}`,
            job.data
        );
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    @Process()
    public async handleEvent(job: Job<Email>): Promise<void> {
        const emailData = job.data;

        const savedEmail = await this.emailRepository.save(emailData);

        if (!this.config.isEmailSyncSendEnabled) {
            this.logger.log(
                `Email saved but not sent because email is disabled. Email id: ${savedEmail.id}`
            );
            return;
        }

        this.logger.log(`Sending an email. Email id: ${savedEmail.id}`);
        emailData;
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
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument
        const info = await this.smtpEmailTransporter.sendMail(sendEmailBody);

        emailData.sentDate = new Date();
        await this.emailRepository.save(emailData);
        this.logger.log(info);
    }
}
