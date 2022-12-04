import {exec} from "child_process";
// eslint-disable-next-line unicorn/import-style
import util from "util";

const execPromise = util.promisify(exec);

export const execAsPromised = async (
    command: string,
    commandArguments: string[],
    cwd: string,
    shell?: string
): Promise<string> => {
    const result = await execPromise(
        `${command} ${commandArguments.join(" ")}`,
        {
            shell: shell || "/bin/bash",
            cwd,
        }
    );

    return result.stdout;
};
