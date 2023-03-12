import {Injectable} from "@nestjs/common";
import {TypeOrmModuleOptions} from "@nestjs/typeorm";
import {SqliteTypeOrmConfigurationProvider} from "./SqliteTypeOrmConfigurationProvider.js";

@Injectable()
export class SqliteDatabaseConfigurationService {
    /**
     * This method uses process.env directly because it is also used in a node script that doesn't have access
     * to NestJS injection.
     * @returns {TypeOrmModuleOptions} Database config for the current env
     */
    public getTypeOrmConfig(): TypeOrmModuleOptions {
        return SqliteTypeOrmConfigurationProvider.getTypeOrmConfig();
    }
}
