import {
    Controller,
    Request,
    Body,
    Param,
    Delete,
    UseGuards,
    Post,
} from "@nestjs/common";

import {ApiBearerAuth, ApiOkResponse, ApiTags} from "@nestjs/swagger";

import {AuthGuard} from "@nestjs/passport";
import {RequestWithUser} from "../authorization/models/RequestWithUser.js";
import {Invitation} from "./entities/invitation.entity.js";
import {InvitationService} from "./invitation.service.js";
import {CreateInvitationDto} from "./dto/create-invitation.dto.js";

@UseGuards(AuthGuard("jwt"))
@ApiBearerAuth()
@Controller("organisations/invitations")
@ApiTags("Organisations")
export class InvitationController {
    constructor(private readonly invitationService: InvitationService) {}

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
            request.user.id
        );

        return deleteResult.deletedDate !== undefined;
    }
}
