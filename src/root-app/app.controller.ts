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
import {MandatoryUserClaims} from "../authorization/guards/MandatoryUserClaims.decorator.js";
import {AppService, HealthResponse} from "./app.service.js";

@Controller("admin/health")
@ApiTags("Application Support")
export class AppController {
    private readonly logger = new Logger(AppController.name);
    constructor(private readonly appService: AppService) {}

    @Get()
    @ApiOkResponse({type: HealthResponse})
    getHello() {
        return this.appService.getHello();
    }

    @UseGuards(DefaultAuthGuard)
    @ApiBearerAuth()
    @Get("is-authorised")
    @ApiOkResponse({type: HealthResponse})
    getHelloAuthorized(@Request() request: RequestWithUser) {
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
    @ApiOkResponse({type: HealthResponse})
    getHelloSuperAdmin(@Request() request: RequestWithUser) {
        const testString = this.appService.getHello();
        const stringifyUser = JSON.stringify(request.user);
        this.logger.log("request user", stringifyUser);
        return testString;
    }
}
