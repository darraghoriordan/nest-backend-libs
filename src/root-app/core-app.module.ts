/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import "reflect-metadata";
import helmet from "helmet";
import {
    ClassSerializerInterceptor,
    INestApplication,
    Module,
    NestApplicationOptions,
    ValidationPipe,
} from "@nestjs/common";
import {LoggerModule} from "../logger/logger.module";
import {AppController} from "./app.controller";
import {AppService} from "./app.service";
import {SwaggerGen} from "./SwaggerGen";
import {NestFactory, Reflector} from "@nestjs/core";
import CoreLoggerService from "../logger/CoreLoggerService";
import {CoreConfigurationService} from "../core-config/CoreConfigurationService";
import {LoggingInterceptor} from "../logger/LoggingInterceptor";
import {CoreConfigModule} from "../core-config/CoreConfig.module";
import {ConfigModule} from "@nestjs/config";
import {BullModule} from "@nestjs/bull";
import {HealthModule} from "../health/Health.module";

@Module({
    imports: [
        ConfigModule.forRoot({cache: true}),
        LoggerModule,
        CoreConfigModule,
        BullModule.forRootAsync({
            imports: [CoreConfigModule],

            useFactory: async (
                configService: CoreConfigurationService

                // eslint-disable-next-line @typescript-eslint/require-await
            ) => {
                const redisUrl = new URL(
                    configService.bullQueueHost || "redis://localhost"
                );
                return {
                    redis: {
                        host: redisUrl.hostname,
                        password: redisUrl.password,
                        port: Number(redisUrl.port),
                        username: redisUrl.username,
                        maxRetriesPerRequest: 3,
                    },
                };
            },
            inject: [CoreConfigurationService],
        }),
        HealthModule,
    ],
    controllers: [AppController],
    providers: [AppService, SwaggerGen],
    exports: [SwaggerGen, BullModule],
})
export class CoreModule {
    public static initApplication(
        // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types,@typescript-eslint/no-explicit-any
        rootModule: any,
        callback: (appModule: INestApplication) => void | Promise<void>,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        options?: NestApplicationOptions
    ): void {
        void (async () => {
            try {
                const app = await NestFactory.create(rootModule, {
                    bodyParser: true,
                    rawBody: true,
                });
                const loggerService = app.get(CoreLoggerService);
                const configService = app.get(CoreConfigurationService);
                app.useLogger(loggerService);
                app.use(helmet());
                app.enableCors({origin: configService.frontEndAppUrl});
                app.useGlobalPipes(
                    new ValidationPipe({
                        transform: true,
                        skipMissingProperties: false,
                        whitelist: true,
                        forbidNonWhitelisted: true,
                        forbidUnknownValues: true,
                    })
                );
                app.useGlobalInterceptors(
                    new ClassSerializerInterceptor(app.get(Reflector)),
                    new LoggingInterceptor(loggerService)
                );

                const swaggerGen = app.get(SwaggerGen);
                swaggerGen.generate(app, "open-api/swagger.json");

                loggerService.log(
                    `will listen on port ${configService.webPort} (DEV: http://localhost:${configService.webPort} )`
                );
                loggerService.log(
                    `swagger will be available at (DEV: http://localhost:${configService.webPort}/swagger )`
                );
                app.enableShutdownHooks();
                await callback(app);
            } catch (initialisationError) {
                // we don't use logger service in case that is broken at initialisation
                console.error(
                    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                    `Failed to initialize, due to: ${initialisationError}`
                );
                // eslint-disable-next-line unicorn/no-process-exit
                process.exit(1);
            }
        })();
    }
}
