import {
    Controller,
    Request,
    Body,
    Param,
    Delete,
    UseGuards,
    Post,
    Query,
    Get,
} from "@nestjs/common";

import {ApiBearerAuth, ApiOkResponse, ApiTags} from "@nestjs/swagger";

import {AuthGuard} from "@nestjs/passport";
import {RequestWithUser} from "../authorization/models/RequestWithUser.js";
import {Invitation} from "./entities/invitation.entity.js";
import {InvitationService} from "./invitation.service.js";
import {CreateInvitationDto} from "./dto/create-invitation.dto.js";

@UseGuards(AuthGuard("jwt"))
@ApiBearerAuth()
@Controller("invitations")
@ApiTags("Invitations")
export class InvitationController {
    constructor(private readonly invitationService: InvitationService) {}

    // The following method exists to expose the query string param
    // but invitation work is kicked off by the auth strategy as it
    // tries to resolve the correct user there in the middleware
    // before the request reaches the controller
    // eslint-disable-next-line @typescript-eslint/require-await
    @Post("accept")
    @ApiOkResponse()
    async accept(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        @Query("invitationId") invitationId: string,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        @Request() request: RequestWithUser
    ): Promise<boolean> {
        return true;
    }

    // this id here feels a bit backwards
    @Get(":orgId")
    @ApiOkResponse({type: [Invitation]})
    async getAllForOrg(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        @Param("orgId") orgId: string,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        @Request() request: RequestWithUser
    ): Promise<Invitation[]> {
        return this.invitationService.getAllForOrg(orgId, request.user);
    }

    @Post()
    @ApiOkResponse({type: Invitation})
    async create(
        @Body() createDto: CreateInvitationDto,
        @Request() request: RequestWithUser
    ) {
        return this.invitationService.create(createDto, request.user);
    }

    @Delete(":uuid")
    @ApiOkResponse({type: Boolean})
    async remove(
        @Param("uuid") uuid: string,
        @Request() request: RequestWithUser
    ): Promise<boolean> {
        const deleteResult = await this.invitationService.remove(
            uuid,
            request.user
        );

        return deleteResult.deletedDate !== undefined;
    }
}
