import {DataSource} from "typeorm";
import {SqliteTypeOrmConfigurationProvider} from "./SqliteTypeOrmConfigurationProvider";
import dotenv from "dotenv";
dotenv.config();

const SqliteMigrationsDataSource = new DataSource(
    SqliteTypeOrmConfigurationProvider.getTypeOrmConfig()
);

export default SqliteMigrationsDataSource;
