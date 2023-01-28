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
    public static getTypeOrmConfig(): DataSourceOptions {
        const nodeModuleCorePath = path.join(
            __dirname,
            process.env.CORE_MODULE_ENTITY_PATH || "..",
            "**",
            "*.entity.{ts,js}"
        );

        const appModulePath = path.join(
            __dirname,
            process.env.APP_MODULE_ENTITY_PATH ||
                "../../../../../apps/backend/dist",
            "**",
            "*.entity.{ts,js}"
        );

        const migrationsPath = path.join(
            __dirname,
            process.env.MIGRATIONS_PATH || "../../../../../apps/backend/dist",
            "**",
            "migrations",
            "*.{ts,js}"
        );
        console.log("Using database configuration paths", {
            appModulePath,
            moduleLocalPath: __dirname,
            migrationsPath,
            nodeModuleCorePath,
            pwd: process.cwd(),
        });

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

    public static getNestTypeOrmConfig(): TypeOrmModuleOptions {
        return {
            ...SqliteTypeOrmConfigurationProvider.getTypeOrmConfig(),
            autoLoadEntities: true,
        };
    }
}
