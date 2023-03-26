import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";

import {DataSource, DataSourceOptions} from "typeorm";
import {DatabaseConfigurationService} from "./PostgresDatabaseConfigurationService.js";
import {PostgresTypeOrmConfigurationProvider} from "./PostgresTypeOrmConfigurationProvider.js";

@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            useFactory: () =>
                PostgresTypeOrmConfigurationProvider.getNestTypeOrmConfig(),
            dataSourceFactory: async (
                options: DataSourceOptions | undefined
            ) => {
                if (options === undefined) {
                    throw new Error("No options provided to dataSourceFactory");
                }
                return await new DataSource(options).initialize();
            },
        }),
    ],
    exports: [DatabaseConfigurationService, TypeOrmModule],
    providers: [DatabaseConfigurationService],
})
export class PostgresDatabaseModule {}
