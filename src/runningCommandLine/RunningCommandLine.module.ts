import {Module} from "@nestjs/common";
import "reflect-metadata";
import {CliCommandService} from "./CliCommandService.js";

@Module({
    imports: [],
    providers: [CliCommandService],
    exports: [CliCommandService],
    controllers: [],
})
export class RunningCommandLineModule {}
