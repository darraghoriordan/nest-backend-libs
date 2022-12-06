import {Injectable} from "@nestjs/common";
import {exec} from "child_process";
// eslint-disable-next-line unicorn/import-style
import util from "util";
import CoreLoggerService from "../logger/CoreLoggerService";

const execPromise = util.promisify(exec);

@Injectable()
export class CliCommandService {
    constructor(private readonly logger: CoreLoggerService) {}
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
