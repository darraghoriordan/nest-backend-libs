import {Module} from "@nestjs/common";
import "reflect-metadata";
import {CoreModule} from "../root-app/core-app.module";
import {CliCommandService} from "./CliCommandService";

@Module({
    imports: [CoreModule],
    providers: [CliCommandService],
    exports: [CliCommandService],
    controllers: [],
})
export class RunningCommandLineModule {}
