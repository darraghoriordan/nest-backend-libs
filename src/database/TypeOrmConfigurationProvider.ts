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
        if (process.env.DATABASE_URL) {
            return {
                type: "postgres",
                url: process.env.DATABASE_URL,
                logging: false,

                migrationsTableName: "migrations",
                migrationsRun: true,
                synchronize: false,
                entities: [
                    path.join(
                        __dirname,
                        "..",
                        process.env.DB_CONFIG_ROOT || "",
                        "**",
                        "*.entity.{ts,js}"
                    ),
                ],
                migrations: [
                    path.join(
                        __dirname,
                        "..",
                        process.env.DB_CONFIG_ROOT || "",
                        "**",
                        "migration",
                        "*.{ts,js}"
                    ),
                ],
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
            entities: [
                path.join(
                    __dirname,
                    "..",
                    process.env.DB_CONFIG_ROOT || "",
                    "**",
                    "*.entity.{ts,js}"
                ),
            ],
            migrations: [
                path.join(
                    __dirname,
                    "..",
                    process.env.DB_CONFIG_ROOT || "",
                    "**",
                    "migration",
                    "*.{ts,js}"
                ),
            ],

            cli: {
                migrationsDir: "src/migration",
            },
        };
    }
}
