import {DataSource} from "typeorm";
import {SqliteTypeOrmConfigurationProvider} from "./SqliteTypeOrmConfigurationProvider";

const SqliteMigrationsDataSource = new DataSource(
    SqliteTypeOrmConfigurationProvider.getTypeOrmConfig()
);

export default SqliteMigrationsDataSource;
