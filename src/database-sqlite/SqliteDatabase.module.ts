import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {SqliteDatabaseConfigurationService} from "./SqliteDatabaseConfigurationService.js";
import {SqliteTypeOrmConfigurationProvider} from "./SqliteTypeOrmConfigurationProvider.js";

@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            useFactory: () =>
                SqliteTypeOrmConfigurationProvider.getNestTypeOrmConfig(),
        }),
    ],
    exports: [SqliteDatabaseConfigurationService, TypeOrmModule],
    providers: [SqliteDatabaseConfigurationService],
})
export class SqliteDatabaseModule {}
