import {describe, it, expect, vi} from "vitest";
import {Test} from "@nestjs/testing";
import {CoreModule} from "./core-app.module.js";
import {
    CoreModuleAsyncOptions,
    CoreModuleOptions,
} from "../core-config/core-config.options.js";
import {
    LoggerModuleAsyncOptions,
    LoggerModuleOptions,
} from "../logger/logger.options.js";
import {CoreConfigurationService} from "../core-config/CoreConfigurationService.js";
import {LoggingConfigurationService} from "../logger/LoggingConfigurationService.js";
import {Logger} from "nestjs-pino";

vi.mock("@nestjs/bullmq", () => {
    class BullModule {
        static forRootAsync() {
            return {
                module: BullModule,
                global: true,
                providers: [],
                exports: [],
            };
        }
    }
    return {BullModule};
});

vi.mock("@nestjs/cache-manager", () => {
    class CacheModule {
        static registerAsync() {
            return {
                module: CacheModule,
                global: true,
                providers: [],
                exports: [],
            };
        }
    }
    return {CacheModule};
});

const createMockCoreOptions = (): CoreModuleAsyncOptions => ({
    useFactory: (): CoreModuleOptions => ({
        webPort: 3000,
        appTitle: "Test App",
        frontEndAppUrl: "http://localhost:3000",
        nodeEnv: "test",
        bullQueueHost: "redis://localhost:6379",
        shouldGenerateSwagger: false,
        shouldAutomaticallyInstallApiModels: false,
        shouldUseNestCors: true,
        helmetOptions: false,
    }),
});

const createMockLoggerOptions = (): LoggerModuleAsyncOptions => ({
    useFactory: (): LoggerModuleOptions => ({
        nodeEnv: "test",
        loggerName: "TestLogger",
        minLevel: "debug",
        httpReqResLogLevel: "warn",
        usePrettyLogs: false,
    }),
});

describe("CoreModule", () => {
    describe("forRootAsync", () => {
        it("should compile and resolve all exported providers when loaded in a NestJS testing module", async () => {
            const moduleRef = await Test.createTestingModule({
                imports: [
                    CoreModule.forRootAsync({
                        core: createMockCoreOptions(),
                        logger: createMockLoggerOptions(),
                    }),
                ],
            }).compile();

            const coreConfigService = moduleRef.get(CoreConfigurationService);
            const loggingConfigService = moduleRef.get(
                LoggingConfigurationService
            );
            const logger = moduleRef.get(Logger);

            expect(coreConfigService).toBeDefined();
            expect(loggingConfigService).toBeDefined();
            expect(logger).toBeDefined();
            expect(coreConfigService.appTitle).toBe("Test App");
            expect(loggingConfigService.loggerName).toBe("TestLogger");
        });
    });
});
