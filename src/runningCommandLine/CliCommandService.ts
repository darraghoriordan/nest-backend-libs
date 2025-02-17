import {Injectable, Logger} from "@nestjs/common";
import {exec} from "child_process";

import util from "util";

const execPromise = util.promisify(exec);

@Injectable()
export class CliCommandService {
    private readonly logger = new Logger(CliCommandService.name);

    public async execAsPromised(
        command: string,
        commandArguments: string[],
        cwd: string,
        shell?: string
    ): Promise<string> {
        this.logger.warn(`Executing cli command '${command}' in '${cwd}'`);
        this.logger.warn(
            "Note: Do NOT allow user input as parameters for 'execAsPromised' as inputs are not sanitised and a hacker could take over your system."
        );
        const result = await execPromise(
            `${command} ${commandArguments.join(" ")}`,
            {
                shell: shell || "/bin/bash",
                cwd,
            }
        );

        return result.stdout;
    }
}
