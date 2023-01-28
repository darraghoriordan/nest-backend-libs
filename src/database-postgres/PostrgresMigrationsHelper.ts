import {DataSource} from "typeorm";
import {PostgresTypeOrmConfigurationProvider} from "./PostgresTypeOrmConfigurationProvider";

const PostgresMigrationsDataSource = new DataSource(
    PostgresTypeOrmConfigurationProvider.getTypeOrmConfig()
);

export default PostgresMigrationsDataSource;
