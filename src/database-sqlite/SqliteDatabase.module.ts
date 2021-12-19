import {Global, Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {SqliteDatabaseConfigurationService} from "./SqliteDatabaseConfigurationService";
import {SqliteTypeOrmConfigurationProvider} from "./SqliteTypeOrmConfigurationProvider";

@Global()
@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            useFactory: () =>
                Object.assign(
                    SqliteTypeOrmConfigurationProvider.getTypeOrmConfig(),
                    {
                        autoLoadEntities: true,
                    }
                ),
        }),
    ],
    exports: [SqliteDatabaseConfigurationService, TypeOrmModule],
    providers: [SqliteDatabaseConfigurationService],
})
export class SqliteDatabaseModule {}
