import {Global, Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {DatabaseConfigurationService} from "./PostgresDatabaseConfigurationService";
import {PostgresTypeOrmConfigurationProvider} from "./PostgresTypeOrmConfigurationProvider";

@Global()
@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            useFactory: () =>
                PostgresTypeOrmConfigurationProvider.getNestTypeOrmConfig(),
        }),
    ],
    exports: [DatabaseConfigurationService, TypeOrmModule],
    providers: [DatabaseConfigurationService],
})
export class PostgresDatabaseModule {}
