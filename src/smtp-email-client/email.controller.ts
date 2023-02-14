import {Controller, Get, UseGuards} from "@nestjs/common";
import {AuthGuard} from "@nestjs/passport";
import {ApiBearerAuth, ApiOkResponse, ApiTags} from "@nestjs/swagger";
import {BooleanResult} from "../root-app/models/boolean-result";
import {SmtpEmailClient} from "./email-client.service";

@ApiBearerAuth()
@ApiTags("Email-client")
@UseGuards(AuthGuard("jwt"))
@Controller("email-client")
export class EmailClientController {
    constructor(private readonly service: SmtpEmailClient) {}

    @Get("verify")
    @ApiOkResponse({type: BooleanResult})
    async verify(): Promise<BooleanResult> {
        await this.service.verify();
        return {result: true};
    }
}
