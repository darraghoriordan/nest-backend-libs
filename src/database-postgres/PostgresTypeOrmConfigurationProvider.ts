import {TypeOrmModuleOptions} from "@nestjs/typeorm";
import path from "path";
import {DataSourceOptions} from "typeorm";
import url from "url";

 
export class PostgresTypeOrmConfigurationProvider {
    /**
     * This method uses process.env directly because it is also used in a node script that doesn't have access
     * to NestJS injection.
     * @returns
     */
    public static getTypeOrmConfig(): DataSourceOptions {
        const libraryEntityScanPath = path.resolve(
            path.join(
                // __dirname,
                process.env.CORE_MODULE_ENTITY_PATH ?? "..",
                "**",
                "*.entity.{ts,js}"
            )
        );

        const appEntityScanPath = path.resolve(
            path.join(
                // __dirname,
                process.env.APP_MODULE_ENTITY_PATH ?? "dist",
                "**",
                "*.entity.{ts,js}"
            )
        );

        const migrationsPath = path.resolve(
            path.join(
                // __dirname,
                process.env.MIGRATIONS_PATH ?? "dist",
                "**",
                "migrations",
                "*.{ts,js}"
            )
        );
        console.log("Using database configuration paths", {
            appEntityScanPath: appEntityScanPath,
            libraryEntityScanPath: libraryEntityScanPath,
            moduleCurrentDirectory: path.dirname(
                url.fileURLToPath(import.meta.url)
            ),
            migrationsPath,
            pwd: process.cwd(),
        });
        // database url is used in dokku
        if (process.env.DATABASE_URL) {
            return {
                type: "postgres",
                url: process.env.DATABASE_URL,
                logging: process.env.APP_POSTGRES_LOGGING === "true",
                migrationsTableName: "migrations",
                migrationsRun: true,
                synchronize: false,
                entities: [libraryEntityScanPath, appEntityScanPath],
                migrations: [migrationsPath],
            };
        }
        // if passing in the pg env vars this is a pg db!
        return {
            type: "postgres",
            host: process.env.APP_POSTGRES_HOST,
            port: Number.parseInt(process.env.APP_POSTGRES_PORT ?? "5000", 10),
            username: process.env.APP_POSTGRES_USER,
            password: process.env.APP_POSTGRES_PASSWORD,
            database: process.env.APP_POSTGRES_DATABASE,
            schema: process.env.APP_POSTGRES_SCHEMA,
            migrationsTableName: "migrations",
            migrationsRun: true,
            logging: process.env.APP_POSTGRES_LOGGING === "true",
            synchronize: false,
            entities: [libraryEntityScanPath, appEntityScanPath],
            migrations: [migrationsPath],
            cli: {
                migrationsDir: "src/migrations",
            },
        } as DataSourceOptions; // this is dynamic based on the type discriminator
    }

    public static getNestTypeOrmConfig(): TypeOrmModuleOptions {
        return {
            ...PostgresTypeOrmConfigurationProvider.getTypeOrmConfig(),
            autoLoadEntities: true,
        };
    }
}
