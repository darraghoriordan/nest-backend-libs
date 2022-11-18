import fs from "fs";
import {PostgresTypeOrmConfigurationProvider} from "./PostgresTypeOrmConfigurationProvider";
import dotenv from "dotenv";
dotenv.config();

fs.writeFileSync(
    "ormconfig.json",
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    JSON.stringify(
        PostgresTypeOrmConfigurationProvider.getTypeOrmConfig(),
        undefined,
        2
    )
);
