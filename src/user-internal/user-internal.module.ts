import {Module} from "@nestjs/common";
import {UserService} from "../user-internal/user.service.js";
import {User} from "../user-internal/entities/user.entity.js";
import {TypeOrmModule} from "@nestjs/typeorm";
import {UserController} from "./user.controller.js";

@Module({
    imports: [TypeOrmModule.forFeature([User])],
    providers: [UserService],
    controllers: [UserController],
    exports: [UserService],
})
export class UserInternalModule {}
