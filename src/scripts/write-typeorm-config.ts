import fs = require("fs");
import {TypeOrmConfigurationProvider} from "../database/TypeOrmConfigurationProvider";
import dotenv from "dotenv";
dotenv.config();

fs.writeFileSync(
    "ormconfig.json",
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    JSON.stringify(
        TypeOrmConfigurationProvider.getTypeOrmConfig(),
        undefined,
        2
    )
);
