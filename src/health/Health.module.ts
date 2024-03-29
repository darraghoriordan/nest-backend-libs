import {HttpModule} from "@nestjs/axios";
import {Module} from "@nestjs/common";
import {TerminusModule} from "@nestjs/terminus";
import {HealthController} from "./Health.controller.js";

@Module({
    imports: [HttpModule, TerminusModule],
    controllers: [HealthController],
})
export class HealthModule {}
