import {Module} from "@nestjs/common";
import {CoreModule} from "../root-app/core-app.module.js";
import {SpServiceProvider} from "./spService.provider.js";
import {SuperPowersController} from "./super-powers.controller.js";

@Module({
    imports: [CoreModule],
    controllers: [SuperPowersController],
    providers: [SpServiceProvider],
})
export class SuperPowersModule {}
