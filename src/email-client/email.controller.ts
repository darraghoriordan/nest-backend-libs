import {Controller, Get, UseGuards} from "@nestjs/common";
import {AuthGuard} from "@nestjs/passport";
import {ApiBearerAuth, ApiOkResponse, ApiTags} from "@nestjs/swagger";
import {EmailClient} from "./email-client.service";

@ApiBearerAuth()
@ApiTags("email-client")
@UseGuards(AuthGuard("jwt"))
@Controller("email-client")
export class EmailClientController {
    constructor(private readonly service: EmailClient) {}

    @Get("verify")
    @ApiOkResponse()
    async verify(): Promise<void> {
        return this.service.verify();
    }
}
