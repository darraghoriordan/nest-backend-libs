/* eslint-disable sonarjs/no-duplicate-string */
/* eslint-disable unicorn/prefer-module */
import {TypeOrmModuleOptions} from "@nestjs/typeorm";
import path from "path";

export class TypeOrmConfigurationProvider {
    /**
     * This method uses process.env directly because it is also used in a node script that doesn't have access
     * to NestJS injection.
     * @returns
     */
    public static getTypeOrmConfig(): TypeOrmModuleOptions {
        console.log("DIRNAME", __dirname);
        const nodeModuleCorePath = path.join(
            __dirname,
            process.env.CORE_MODULE_ENTITY_PATH || "",
            "**",
            "*.entity.{ts,js}"
        );
        console.log("Using core entity path:", nodeModuleCorePath);

        const appModulePath = path.join(
            __dirname,
            process.env.APP_MODULE_ENTITY_PATH || "",
            "**",
            "*.entity.{ts,js}"
        );
        console.log("Using application entity path:", appModulePath);

        const migrationsPath = path.join(
            __dirname,
            process.env.MIGRATIONS_PATH || "",
            "**",
            "migrations",
            "*.{ts,js}"
        );
        console.log("Using migration path:", migrationsPath);

        if (process.env.DATABASE_URL) {
            return {
                type: "postgres",
                url: process.env.DATABASE_URL,
                logging: false,
                migrationsTableName: "migrations",
                migrationsRun: true,
                synchronize: false,
                entities: [nodeModuleCorePath, appModulePath],
                migrations: [migrationsPath],
                cli: {
                    migrationsDir: "src/migrations",
                },
            };
        }

        return {
            type: "postgres",
            host: process.env.APP_POSTGRES_HOST,
            port: Number.parseInt(process.env.APP_POSTGRES_PORT || "5000", 10),
            username: process.env.APP_POSTGRES_USER,
            password: process.env.APP_POSTGRES_PASSWORD,
            database: process.env.APP_POSTGRES_DATABASE,
            schema: process.env.APP_POSTGRES_SCHEMA,
            migrationsTableName: "migrations",
            migrationsRun: true,
            logging: true,
            synchronize: false,
            entities: [nodeModuleCorePath, appModulePath],
            migrations: [migrationsPath],
            cli: {
                migrationsDir: "src/migrations",
            },
        };
    }
}
