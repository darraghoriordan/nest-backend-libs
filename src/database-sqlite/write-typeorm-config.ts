import fs = require("fs");
import dotenv from "dotenv";
import {SqliteTypeOrmConfigurationProvider} from "./SqliteTypeOrmConfigurationProvider";
dotenv.config();

fs.writeFileSync(
    "ormconfig.json",
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    JSON.stringify(
        SqliteTypeOrmConfigurationProvider.getTypeOrmConfig(),
        undefined,
        2
    )
);
