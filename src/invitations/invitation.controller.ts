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
import {RequestWithUser} from "../authz/RequestWithUser";
import {Invitation} from "./entities/invitation.entity";
import {InvitationService} from "./invitation.service";
import {CreateInvitationDto} from "./dto/create-invitation.dto";

@UseGuards(AuthGuard("jwt"))
@ApiBearerAuth()
@Controller("organisations/invitations")
@ApiTags("organisations")
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
    @ApiOkResponse({type: Invitation})
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
