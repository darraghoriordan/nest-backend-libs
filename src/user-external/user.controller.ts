import {
    Controller,
    Get,
    Request,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    BadRequestException,
} from "@nestjs/common";
import {UserService} from "../user-internal/user.service";
import {UpdateUserDto} from "../user-internal/dto/update-user.dto";
import {ApiBearerAuth, ApiOkResponse, ApiTags} from "@nestjs/swagger";
import {RequestWithUser} from "../authz/RequestWithUser";
import {isUUID} from "class-validator";
import {BooleanResult} from "../root-app/models/boolean-result";
import {UserDto} from "../user-internal/dto/userResponseDto";
import {User} from "../user-internal/entities/user.entity";
import {
    ClaimsAuthorisationGuard,
    DefaultAuthGuard,
    MandatoryUserClaims,
    SuperUserClaims,
} from "../authz";

@UseGuards(DefaultAuthGuard, ClaimsAuthorisationGuard)
@ApiBearerAuth()
@Controller("user")
@ApiTags("Users")
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Get(":uuid")
    @ApiOkResponse({type: UserDto})
    async findOne(
        @Request() request: RequestWithUser,
        @Param("uuid") uuid: string
    ): Promise<UserDto> {
        if (uuid === "me") {
            return {
                ...request.user,
                isSuper: request.user.permissions.includes(
                    SuperUserClaims.MODIFY_ALL
                ),
            };
        }
        if (!isUUID(uuid, "4")) {
            throw new BadRequestException(uuid, "Invalid UUID");
        }

        // find the user if they are in the same organisation as the user
        const result = await this.userService.findOneIfSameOrganisation(
            uuid,
            request.user
        );
        return {
            ...result,
            isSuper: request.user.permissions.includes(
                SuperUserClaims.MODIFY_ALL
            ),
        };
    }

    @Get()
    @MandatoryUserClaims("read:all")
    @ApiOkResponse({type: UserDto, isArray: true})
    async findAll(): Promise<User[]> {
        return await this.userService.findAll();
    }

    @Patch(":uuid")
    @ApiOkResponse({type: BooleanResult})
    async update(
        @Param("uuid") uuid: string,
        @Body() updateUserDto: UpdateUserDto,
        @Request() request: RequestWithUser
    ) {
        const result = await this.userService.update(
            uuid,
            updateUserDto,
            request.user.uuid
        );
        return {result: result.affected && result.affected > 0};
    }

    @Delete(":uuid")
    @ApiOkResponse({type: BooleanResult})
    async remove(
        @Param("uuid") uuid: string,
        @Request() request: RequestWithUser
    ): Promise<BooleanResult> {
        const deleteResult = await this.userService.remove(
            uuid,
            request.user.uuid
        );
        return {result: deleteResult !== undefined};
    }
}
