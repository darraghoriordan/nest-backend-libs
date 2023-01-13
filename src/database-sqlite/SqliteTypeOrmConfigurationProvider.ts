/* eslint-disable unicorn/prefer-module */

import {TypeOrmModuleOptions} from "@nestjs/typeorm";
import path from "path";
import {DataSourceOptions} from "typeorm";

export class SqliteTypeOrmConfigurationProvider {
    /**
     * This method uses process.env directly because it is also used in a node script that doesn't have access
     * to NestJS injection.
     * @returns
     */
    public static getTypeOrmConfig(): TypeOrmModuleOptions {
        console.log("DIRNAME", __dirname);
        const nodeModuleCorePath = path.join(
            __dirname,
            process.env.CORE_MODULE_ENTITY_PATH || "..",
            "**",
            "*.entity.{ts,js}"
        );
        console.log("Using core entity path:", nodeModuleCorePath);

        const appModulePath = path.join(
            __dirname,
            process.env.APP_MODULE_ENTITY_PATH ||
                "../../../../../apps/backend/dist",
            "**",
            "*.entity.{ts,js}"
        );
        console.log("Using application entity path:", appModulePath);

        const migrationsPath = path.join(
            __dirname,
            process.env.MIGRATIONS_PATH || "../../../../../apps/backend/dist",
            "**",
            "migrations",
            "*.{ts,js}"
        );
        console.log("Using migration path:", migrationsPath);

        return {
            type: "sqlite",
            database: process.env.APP_SQLITE_DATABASE_PATH,
            logging: false,
            migrationsTableName: "migrations",
            migrationsRun: false,
            synchronize: false,
            entities: [nodeModuleCorePath, appModulePath],
            migrations: [migrationsPath],
            cli: {
                migrationsDir: "src/migrations",
            },
        } as DataSourceOptions;
    }
}
