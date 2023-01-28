/* eslint-disable @typescript-eslint/require-await */
import * as yargs from "yargs";
import chalk from "chalk";
import fs from "fs";
import dotenv from "dotenv";
import {PostgresTypeOrmConfigurationProvider} from "../../database-postgres/PostgresTypeOrmConfigurationProvider";
import {SqliteTypeOrmConfigurationProvider} from "../../database-sqlite/SqliteTypeOrmConfigurationProvider";
dotenv.config();
/**
 * Generates a new migration file with sql needs to be executed to update schema.
 */

type ArgumentsType = {o: string; db: string};

export class WriteTypeOrmConfigCommand
    implements yargs.CommandModule<ArgumentsType, ArgumentsType>
{
    command = "db:write-config";
    describe = "Writes the latest orm config to ormconfig.json.";

    // eslint-disable-next-line unicorn/prevent-abbreviations
    builder(args: yargs.Argv) {
        return args
            .option("o", {
                alias: "outputFileName",
                type: "string",
                default: "ormconfig.json",
                describe:
                    "The path to the output json file. Must include filename.",
            })
            .option("db", {
                alias: "dbProvider",
                type: "string",
                default: "pg",
                describe:
                    "The database provider to use. Currently only supports 'pg' and 'sqlite'. For other providers, you will need to write your own config file.",
            });
    }

    async handler(
        // eslint-disable-next-line unicorn/prevent-abbreviations
        args: yargs.ArgumentsCamelCase<ArgumentsType>
    ): Promise<void> {
        // const fullPath = (args.path as string).startsWith("/")
        //     ? (args.path as string)
        //     : path.resolve(process.cwd(), args.path as string);

        let config = PostgresTypeOrmConfigurationProvider.getTypeOrmConfig();

        if (args.db === "sqlite") {
            config = SqliteTypeOrmConfigurationProvider.getTypeOrmConfig();
        }
        console.log(chalk.green(`Writing config to ${args.o}`));

        fs.writeFileSync(args.o, JSON.stringify(config, undefined, 2));
    }
}
