import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {Transporter, createTransport} from "nodemailer";
import {Repository} from "typeorm";
import CoreLoggerService from "../logger/CoreLoggerService";
import {Email} from "./email.entity";
import {EmailConfigurationService} from "./EmailConfigurationService";

@Injectable()
export class EmailClient {
    private transporter: Transporter;
    constructor(
        private logger: CoreLoggerService,
        @InjectRepository(Email)
        private emailRepository: Repository<Email>,
        private config: EmailConfigurationService
    ) {
        // create reusable transporter object using the default SMTP transport
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-call
        this.transporter = createTransport({
            host: "smtp.fastmail.com",
            port: 587,
            secure: false, // true for 465, false for other ports
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            auth: {
                user: this.config.emailUsername,
                pass: this.config.emailPassword,
            },
        });
    }

    public async verify() {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call
        await this.transporter.verify();
    }

    public async sendMail(
        to: string[],
        bccTo: string[],
        subject: string,
        body: string,
        sendingUserAuth0Id: string
    ) {
        const serialisedEmailAddresses = to.join(",");

        const email = this.emailRepository.create();
        email.body = body;
        email.to = serialisedEmailAddresses;
        email.subject = subject;
        email.ownerId = sendingUserAuth0Id;

        const savedEmail = await this.emailRepository.save(email);
        if (!this.config.isEmailSyncSendEnabled) {
            this.logger.log(
                `Email saved but not sent because email is disabled. Email id: ${savedEmail.id}`
            );
            return;
        }

        this.logger.log(`Sending an email. Email id: ${savedEmail.id}`);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call
        const info = await this.transporter.sendMail({
            from: this.config.senderEmailAddress, // sender address
            to: serialisedEmailAddresses, // list of receivers
            subject: subject, // Subject line
            text: body, // plain text body
            //  html: "<b>Hello world?</b>", // html body
        } as any);
        email.sentDate = new Date();
        await this.emailRepository.save(email);
        this.logger.log(info);
    }
}
