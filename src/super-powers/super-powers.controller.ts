import {UseGuards, Controller, Post} from "@nestjs/common";
import {ApiBearerAuth, ApiTags, ApiOkResponse} from "@nestjs/swagger";
import {ClaimsAuthorisationGuard} from "../authorization/guards/ClaimsAuthorisationGuard.js";
import {DefaultAuthGuard} from "../authorization/guards/DefaultAuthGuard.js";
import {MandatoryUserClaims} from "../authorization/guards/MandatoryUserClaims.decorator.js";
import {SuperPowersService} from "./super-powers.service.js";

@UseGuards(DefaultAuthGuard, ClaimsAuthorisationGuard)
@ApiBearerAuth()
@Controller("super-powers")
@ApiTags("Application Support")
export class SuperPowersController {
    constructor(private readonly spService: SuperPowersService) {}

    @Post("reset-database")
    @ApiOkResponse()
    @MandatoryUserClaims("modify:all")
    async resetDatabase(): Promise<boolean> {
        return this.spService.resetDatabase();
    }
}
