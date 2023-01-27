import {Injectable} from "@nestjs/common";
import {TypeOrmModuleOptions} from "@nestjs/typeorm";
import {PostgresTypeOrmConfigurationProvider} from "./PostgresTypeOrmConfigurationProvider";

@Injectable()
export class DatabaseConfigurationService {
    /**
     * @returns {TypeOrmModuleOptions} Database config for the current env
     */
    public getTypeOrmConfig(): TypeOrmModuleOptions {
        return PostgresTypeOrmConfigurationProvider.getTypeOrmConfig();
    }
}
