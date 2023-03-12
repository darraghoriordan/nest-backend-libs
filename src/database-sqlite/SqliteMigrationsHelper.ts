import {DataSource} from "typeorm";
import {SqliteTypeOrmConfigurationProvider} from "./SqliteTypeOrmConfigurationProvider.js";
import dotenv from "dotenv";
dotenv.config();

const SqliteMigrationsDataSource = new DataSource(
    SqliteTypeOrmConfigurationProvider.getTypeOrmConfig()
);

export default SqliteMigrationsDataSource;
