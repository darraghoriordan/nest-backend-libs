import {Global, Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {SqliteDatabaseConfigurationService} from "./SqliteDatabaseConfigurationService";
import {SqliteTypeOrmConfigurationProvider} from "./SqliteTypeOrmConfigurationProvider";

@Global()
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
