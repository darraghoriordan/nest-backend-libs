/* eslint-disable @typescript-eslint/require-await */
import * as yargs from "yargs";
import {exec} from "child_process";
// eslint-disable-next-line unicorn/import-style
import util from "util";
import path from "path";

/**
 * Generates a new migration file with sql needs to be executed to update schema.
 */

type ArgumentsType = {
    o: string;
    fePath: string;
    itPath: string;
    packageName: string;
};

export class WriteApiClientCommand
    implements yargs.CommandModule<ArgumentsType, ArgumentsType>
{
    command = "api:write-client";
    describe =
        "Generates a new api client and installs it into frontend and integration test apps.";

    // eslint-disable-next-line unicorn/prevent-abbreviations
    builder(args: yargs.Argv) {
        return args
            .option("o", {
                type: "string",
                default: "../../libs/shared-api-client",
                describe: "The output directory for the generated client.",
            })
            .option("fePath", {
                type: "string",
                default: "../../apps/frontend",
                describe: "The relative path to the frontend app.",
            })
            .option("itPath", {
                type: "string",
                default: "../../apps/backend-e2e",
                describe: "The relative path to the integration test app.",
            })
            .option("packageName", {
                type: "string",
                demandOption: true,
                describe: "The name of package being created",
            });
    }

    async handler(
        // eslint-disable-next-line unicorn/prevent-abbreviations
        args: yargs.ArgumentsCamelCase<any> // this breaks if i use ArgumentsType but change back for dev
    ): Promise<void> {
        // call the script
        console.log(
            "Starting api client write. Please be patient. This might take a minute..."
        );
        const execPromise = util.promisify(exec);
        const commandArguments = [
            args.o,
            args.fePath,
            args.itPath,
            args.packageName,
        ];
        // if i ever use modules later
        // const __dirname = dirname(fileURLToPath(import.meta.url));

        const scriptPath = path.join(
            // eslint-disable-next-line  unicorn/prefer-module
            __dirname,
            "../../open-api-generation/generate.sh"
        );
        const result = await execPromise(
            `${scriptPath} ${commandArguments.join(" ")}`
        );

        console.log(result.stdout);
    }
}
