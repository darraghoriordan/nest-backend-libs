import {Global, Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import {DatabaseConfigurationService} from "./DatabaseConfigurationService";
import {TypeOrmConfigurationProvider} from "./TypeOrmConfigurationProvider";

@Global()
@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            useFactory: () =>
                Object.assign(TypeOrmConfigurationProvider.getTypeOrmConfig(), {
                    autoLoadEntities: true,
                }),
        }),
    ],
    exports: [DatabaseConfigurationService, TypeOrmModule],
    providers: [DatabaseConfigurationService],
})
export class DatabaseModule {}
