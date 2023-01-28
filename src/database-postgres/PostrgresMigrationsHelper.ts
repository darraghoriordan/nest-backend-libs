import {DataSource} from "typeorm";
import {PostgresTypeOrmConfigurationProvider} from "./PostgresTypeOrmConfigurationProvider";
import dotenv from "dotenv";
dotenv.config();
const PostgresMigrationsDataSource = new DataSource(
    PostgresTypeOrmConfigurationProvider.getTypeOrmConfig()
);

export default PostgresMigrationsDataSource;
