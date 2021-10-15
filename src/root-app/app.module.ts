/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import "reflect-metadata";
import {
    ClassSerializerInterceptor,
    INestApplication,
    Module,
    NestApplicationOptions,
    ValidationPipe,
} from "@nestjs/common";
import {AuthzModule} from "../authz/authz.module";
import {LoggerModule} from "../logger/logger.module";
import {AppController} from "./app.controller";
import {AppService} from "./app.service";
import {SwaggerGen} from "./SwaggerGen";
import {EmailClientModule} from "../email-client/email-client.module";
import {DatabaseModule} from "../database/Database.module";
import {NestFactory, Reflector} from "@nestjs/core";
import CoreLoggerService from "../logger/CoreLoggerService";
import {CoreConfigurationService} from "../core-config/CoreConfigurationService";
import {LoggingInterceptor} from "../logger/LoggingInterceptor";
import {HttpLogResponse} from "./httpLogResponseContent";
import {CoreConfigModule} from "../core-config/CoreConfig.module";

@Module({
    imports: [
        LoggerModule,
        CoreConfigModule,
        DatabaseModule,
        AuthzModule,
        EmailClientModule,
    ],
    controllers: [AppController],
    providers: [AppService, SwaggerGen],
    exports: [SwaggerGen],
})
export class AppModule {
    public static initApplication(
        // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types,@typescript-eslint/no-explicit-any
        rootModule: any,
        callback: (appModule: INestApplication) => void | Promise<void>,
        options?: NestApplicationOptions
    ): void {
        void (async () => {
            try {
                const app = await NestFactory.create(AppModule);
                const loggerService = app.get(CoreLoggerService);
                const configService = app.get(CoreConfigurationService);
                app.useLogger(loggerService);

                app.enableCors({origin: configService.clientCorsUrl});
                app.useGlobalPipes(
                    new ValidationPipe({
                        transform: true,
                        skipMissingProperties: false,
                    })
                );
                app.useGlobalInterceptors(
                    new ClassSerializerInterceptor(app.get(Reflector)),
                    new LoggingInterceptor(loggerService)
                );
                app.useGlobalInterceptors(new HttpLogResponse());
                const configuredPort = configService.webPort;
                const swaggerGen = app.get(SwaggerGen);
                swaggerGen.generate(app, "open-api/swagger.json");

                await app.listen(configuredPort);

                loggerService.log(
                    `listening on http://localhost:${configService.webPort}`
                );

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
