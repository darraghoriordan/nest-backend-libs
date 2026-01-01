import "reflect-metadata";
import helmet from "helmet";
import {
    BadRequestException,
    ClassSerializerInterceptor,
    DynamicModule,
    INestApplication,
    Module,
    ValidationPipe,
} from "@nestjs/common";
import {Logger, LoggerModule} from "nestjs-pino";
import {AppController} from "./app.controller.js";
import {AppService} from "./app.service.js";
import {SwaggerGen} from "./SwaggerGen.js";
import {NestFactory, Reflector} from "@nestjs/core";
import {CoreConfigurationService} from "../core-config/CoreConfigurationService.js";
import {CoreConfigModule} from "../core-config/CoreConfig.module.js";
import {BullModule} from "@nestjs/bull";
import {HealthModule} from "../health/Health.module.js";
import type {RedisClientOptions} from "redis";
import {CacheModule} from "@nestjs/cache-manager";
import KeyvRedis from "@keyv/redis";
import {CoreModuleAsyncOptions} from "../core-config/core-config.options.js";
import {
    LoggerModuleAsyncOptions,
    LOGGER_MODULE_OPTIONS,
} from "../logger/logger.options.js";
import {LoggingConfigurationService} from "../logger/LoggingConfigurationService.js";

export interface CoreModuleForRootAsyncOptions {
    core: CoreModuleAsyncOptions;
    logger: LoggerModuleAsyncOptions;
}

@Module({})
export class CoreModule {
    static forRoot(): never {
        throw new Error(
            "CoreModule.forRoot() is not supported. Use forRootAsync() instead."
        );
    }

    static forRootAsync(options: CoreModuleForRootAsyncOptions): DynamicModule {
        return {
            module: CoreModule,
            global: true,
            imports: [
                // Core config
                CoreConfigModule.forRootAsync(options.core),
                // Bull queue - uses core config
                BullModule.forRootAsync({
                    imports: [CoreConfigModule.forRootAsync(options.core)],
                    useFactory: (configService: CoreConfigurationService) => {
                        const redisUrl = new URL(configService.bullQueueHost);
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
                // Cache - uses core config
                CacheModule.registerAsync<RedisClientOptions>({
                    imports: [CoreConfigModule.forRootAsync(options.core)],
                    useFactory: (configService: CoreConfigurationService) => {
                        const redis = new KeyvRedis(
                            configService.bullQueueHost
                        );
                        return {
                            stores: [redis],
                        };
                    },
                    isGlobal: true,
                    inject: [CoreConfigurationService],
                }),
                // Health check
                HealthModule,
                // Pino logger - uses logger config
                LoggerModule.forRootAsync({
                    imports: [...(options.logger.imports || [])],
                    inject: [LOGGER_MODULE_OPTIONS],
                    useFactory: (loggerOptions: {
                        minLevel?: string;
                        usePrettyLogs?: boolean;
                    }) => {
                        return {
                            pinoHttp: {
                                level: loggerOptions.minLevel ?? "debug",
                                transport: loggerOptions.usePrettyLogs
                                    ? {target: "pino-pretty"}
                                    : undefined,
                            },
                        };
                    },
                }),
            ],
            controllers: [AppController],
            providers: [
                // Provide logger options for pino config
                {
                    provide: LOGGER_MODULE_OPTIONS,
                    useFactory: options.logger.useFactory,
                    inject: options.logger.inject || [],
                },
                LoggingConfigurationService,
                AppService,
                SwaggerGen,
            ],
            exports: [
                BullModule,
                CacheModule,
                CoreConfigModule,
                LoggerModule,
                LoggingConfigurationService,
                SwaggerGen,
            ],
        };
    }

    public static initApplication(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        rootModule: any,
        callback: (appModule: INestApplication) => void | Promise<void>
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

                if (configService.globalPrefix) {
                    app.setGlobalPrefix(configService.globalPrefix, {
                        exclude: ["health"],
                    });
                }

                const helmetOptions = configService.helmetOptions;
                if (helmetOptions !== false) {
                    app.use(helmet(helmetOptions ?? undefined));
                }
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
                        exceptionFactory: (error) => {
                            loggerService.error(error);
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

                const baseUrl = `http://localhost:${String(configService.webPort)}`;
                const prefixPath = configService.globalPrefix
                    ? `/${configService.globalPrefix}`
                    : "";
                const swaggerPath = configService.globalPrefix
                    ? `/${configService.globalPrefix}/swagger`
                    : "/swagger";

                loggerService.log(
                    `will listen on port ${String(configService.webPort)} (DEV: ${baseUrl}${prefixPath} )`
                );
                loggerService.log(
                    `swagger will be available at (DEV: ${baseUrl}${swaggerPath} )`
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
