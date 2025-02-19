import "reflect-metadata";
import helmet from "helmet";
import {
    BadRequestException,
    ClassSerializerInterceptor,
    INestApplication,
    Module,
    NestApplicationOptions,
    ValidationPipe,
} from "@nestjs/common";
import {Logger, LoggerModule} from "nestjs-pino";
import {AppController} from "./app.controller.js";
import {AppService} from "./app.service.js";
import {SwaggerGen} from "./SwaggerGen.js";
import {NestFactory, Reflector} from "@nestjs/core";
import {CoreConfigurationService} from "../core-config/CoreConfigurationService.js";
import {CoreConfigModule} from "../core-config/CoreConfig.module.js";
import {ConfigModule} from "@nestjs/config";
import {BullModule} from "@nestjs/bull";
import {HealthModule} from "../health/Health.module.js";
import {LoggerModule as LoggingConfigModule} from "../logger/logger.module.js";
import {LoggingConfigurationService} from "../logger/LoggingConfigurationService.js";
import {AuthzModule} from "../authorization/authz.module.js";
import type {RedisClientOptions} from "redis";
import {CacheModule} from "@nestjs/cache-manager";
import {createKeyv} from "@keyv/redis";

@Module({
    imports: [
        AuthzModule,
        BullModule.forRootAsync({
            imports: [CoreConfigModule],

            useFactory: (configService: CoreConfigurationService) => {
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
        CacheModule.registerAsync<RedisClientOptions>({
            imports: [CoreConfigModule],
            // eslint-disable-next-line @typescript-eslint/require-await
            useFactory: async (configService: CoreConfigurationService) => {
                return {
                    stores: [
                        createKeyv(
                            configService.bullQueueHost || "should-throw"
                        ),
                    ],
                };
            },
            isGlobal: true,
            inject: [CoreConfigurationService],
        }),

        ConfigModule.forRoot({cache: true, isGlobal: true}),
        CoreConfigModule,
        HealthModule,
        LoggerModule.forRootAsync({
            imports: [LoggingConfigModule],
            inject: [LoggingConfigurationService],
            // eslint-disable-next-line @typescript-eslint/require-await
            useFactory: async (config: LoggingConfigurationService) => {
                return {
                    pinoHttp: {
                        level: config.minLevel,
                        transport: config.usePrettyLogs
                            ? {target: "pino-pretty"}
                            : undefined,
                    },
                };
            },
        }),
    ],
    controllers: [AppController],
    providers: [AppService, SwaggerGen],
    exports: [AuthzModule, BullModule, CacheModule, LoggerModule, SwaggerGen],
})
export class CoreModule {
    public static initApplication(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
                    bufferLogs: true,
                });
                const loggerService = app.get(Logger);
                const configService = app.get(CoreConfigurationService);
                app.useLogger(loggerService);
                app.flushLogs();

                app.use(helmet());
                app.enableCors({
                    origin: [configService.frontEndAppUrl],
                });
                app.useGlobalPipes(
                    new ValidationPipe({
                        transform: true,
                        skipMissingProperties: false,
                        whitelist: true,
                        forbidNonWhitelisted: true,
                        forbidUnknownValues: true,
                        exceptionFactory: (e) => {
                            loggerService.error(e);
                            throw new BadRequestException(
                                "Bad request, please check your input"
                            );
                        },
                    })
                );
                app.useGlobalInterceptors(
                    new ClassSerializerInterceptor(app.get(Reflector))
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

                process.exit(1);
            }
        })();
    }
}
