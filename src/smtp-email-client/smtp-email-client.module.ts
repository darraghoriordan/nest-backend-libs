import {BullModule} from "@nestjs/bull";
import {DynamicModule, Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {SmtpEmailClient} from "./email-client.service.js";
import {EmailClientController} from "./email.controller.js";
import {Email} from "./email.entity.js";
import {EmailTransporterProvider} from "./EmailTransporterProvider.js";
import {EmailConfigurationService} from "./EmailConfigurationService.js";
import {SmtpEmailHandler} from "./smtp-email-handler.js";
import {
    SMTP_EMAIL_MODULE_OPTIONS,
    SmtpEmailModuleAsyncOptions,
} from "./smtp-email-client.options.js";

@Module({})
export class SmtpEmailClientModule {
    static forRoot(): never {
        throw new Error(
            "SmtpEmailClientModule.forRoot() is not supported. Use forRootAsync() instead."
        );
    }

    static forRootAsync(options: SmtpEmailModuleAsyncOptions): DynamicModule {
        return {
            module: SmtpEmailClientModule,
            global: options.isGlobal ?? true,
            imports: [
                ...(options.imports || []),
                BullModule.registerQueueAsync({
                    name: "smtp-emails",
                }),
                TypeOrmModule.forFeature([Email]),
            ],
            providers: [
                {
                    provide: SMTP_EMAIL_MODULE_OPTIONS,
                    useFactory: options.useFactory,
                    inject: options.inject || [],
                },
                EmailConfigurationService,
                EmailTransporterProvider,
                SmtpEmailClient,
                SmtpEmailHandler,
            ],
            controllers: [EmailClientController],
            exports: [BullModule, SmtpEmailClient],
        };
    }
}
