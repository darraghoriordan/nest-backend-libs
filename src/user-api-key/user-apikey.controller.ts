import {
    Controller,
    Request,
    Body,
    Param,
    Delete,
    UseGuards,
    Put,
    Post,
    Get,
} from "@nestjs/common";
import {ApiBearerAuth, ApiOkResponse, ApiTags} from "@nestjs/swagger";
import {RequestWithUser} from "../authorization/models/RequestWithUser.js";
import {BooleanResult} from "../root-app/models/boolean-result.js";
import {UserApiKey} from "./userApiKey.entity.js";
import {UserApiKeyService} from "./user-apikey.service.js";
import CreateApiKeyDto from "./CreateApiKeyDto.js";
import {ClaimsAuthorisationGuard} from "../authorization/guards/ClaimsAuthorisationGuard.js";
import {DefaultAuthGuard} from "../authorization/guards/DefaultAuthGuard.js";

@UseGuards(DefaultAuthGuard, ClaimsAuthorisationGuard)
@ApiBearerAuth()
@Controller("api-key")
@ApiTags("Users")
export class UserApiKeyController {
    constructor(private readonly apiKeyService: UserApiKeyService) {}

    @Get()
    @ApiOkResponse({type: UserApiKey, isArray: true})
    async getAllForUser(
        @Request() request: RequestWithUser
    ): Promise<UserApiKey[]> {
        return this.apiKeyService.getAllForUser(request.user.uuid);
    }

    @Put(":uuid")
    @ApiOkResponse({type: UserApiKey})
    async generateNewKey(
        @Param("uuid") uuid: string,
        @Request() request: RequestWithUser
    ) {
        return await this.apiKeyService.refreshKeyValue(
            uuid,
            request.user.uuid
        );
    }

    @Post()
    @ApiOkResponse({type: UserApiKey})
    async update(
        @Body() createKeyDto: CreateApiKeyDto,
        @Request() request: RequestWithUser
    ) {
        return await this.apiKeyService.createKey(
            request.user.id,
            createKeyDto.description
        );
    }

    @Delete(":uuid")
    @ApiOkResponse({type: BooleanResult})
    async remove(
        @Param("uuid") uuid: string,
        @Request() request: RequestWithUser
    ): Promise<BooleanResult> {
        const isDeleted = await this.apiKeyService.remove(
            uuid,
            request.user.uuid
        );
        return {result: isDeleted};
    }
}
