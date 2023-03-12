import {DataSource} from "typeorm";
import {PostgresTypeOrmConfigurationProvider} from "./PostgresTypeOrmConfigurationProvider.js";
import dotenv from "dotenv";
dotenv.config();
const PostgresMigrationsDataSource = new DataSource(
    PostgresTypeOrmConfigurationProvider.getTypeOrmConfig()
);

export default PostgresMigrationsDataSource;
