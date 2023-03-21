/* eslint-disable sonarjs/no-identical-functions */
import {Controller, Get, UseGuards, Request, Logger} from "@nestjs/common";
import {
    ApiBearerAuth,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
} from "@nestjs/swagger";
import {ClaimsAuthorisationGuard} from "../authorization/guards/ClaimsAuthorisationGuard.js";
import {DefaultAuthGuard} from "../authorization/guards/DefaultAuthGuard.js";
import {RequestWithUser} from "../authorization/models/RequestWithUser.js";
import {MandatoryUserClaims} from "../index.js";
import {AppService} from "./app.service.js";

@Controller()
@ApiTags("Application Support")
export class AppController {
    private readonly logger = new Logger(AppController.name);
    constructor(private readonly appService: AppService) {}

    @Get()
    @ApiOkResponse({type: String})
    getHello(): string {
        return this.appService.getHello();
    }

    @UseGuards(DefaultAuthGuard)
    @ApiBearerAuth()
    @Get("is-authorised")
    @ApiOkResponse({type: String})
    getHelloAuthorized(@Request() request: RequestWithUser): string {
        const testString = this.appService.getHello();
        const stringifyUser = JSON.stringify(request.user);
        this.logger.log("request user", stringifyUser);
        return testString;
    }

    @UseGuards(DefaultAuthGuard, ClaimsAuthorisationGuard)
    @ApiBearerAuth()
    @MandatoryUserClaims("read:all")
    @ApiOperation({tags: ["SuperPower"]})
    @Get("is-super-admin")
    @ApiOkResponse({type: String})
    getHelloSuperAdmin(@Request() request: RequestWithUser): string {
        const testString = this.appService.getHello();
        const stringifyUser = JSON.stringify(request.user);
        this.logger.log("request user", stringifyUser);
        return testString;
    }
}
