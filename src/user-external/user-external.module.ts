import {Module} from "@nestjs/common";
import {UserController} from "./user.controller";
import {UserInternalModule} from "../user-internal/user-internal.module";

@Module({
    imports: [UserInternalModule],
    controllers: [UserController],
})
export class UserExternalModule {}
