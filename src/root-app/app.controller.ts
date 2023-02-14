import {Controller, Get, UseGuards, Request, Logger} from "@nestjs/common";
import {AuthGuard} from "@nestjs/passport";
import {ApiBearerAuth, ApiOkResponse, ApiTags} from "@nestjs/swagger";
import {RequestWithUser} from "../authz/RequestWithUser";
import {AppService} from "./app.service";

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

    @UseGuards(AuthGuard("jwt"))
    @ApiBearerAuth()
    @Get("authorise")
    @ApiOkResponse({type: String})
    getHelloAuthorized(@Request() request: RequestWithUser): string {
        const testString = this.appService.getHello();
        const stringifyUser = JSON.stringify(request.user);
        this.logger.log("request user", stringifyUser);
        return testString;
    }
}
