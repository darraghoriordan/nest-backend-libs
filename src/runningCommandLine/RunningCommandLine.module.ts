import {Module} from "@nestjs/common";
import "reflect-metadata";
import {CliCommandService} from "./CliCommandService";

@Module({
    imports: [],
    providers: [CliCommandService],
    exports: [CliCommandService],
    controllers: [],
})
export class RunningCommandLineModule {}
