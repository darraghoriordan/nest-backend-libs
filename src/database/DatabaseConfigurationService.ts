import {Injectable} from "@nestjs/common";
import {TypeOrmModuleOptions} from "@nestjs/typeorm";
import {TypeOrmConfigurationProvider} from "./TypeOrmConfigurationProvider";

@Injectable()
export class DatabaseConfigurationService {
    /**
     * This method uses process.env directly because it is also used in a node script that doesn't have access
     * to NestJS injection.
     * @returns {TypeOrmModuleOptions} Database config for the current env
     */
    public getTypeOrmConfig(): TypeOrmModuleOptions {
        return TypeOrmConfigurationProvider.getTypeOrmConfig();
    }
}
