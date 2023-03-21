import {Module} from "@nestjs/common";
import {UserInternalModule} from "../user/user-internal.module.js";
import {UserApiKeyService} from "./user-apikey.service.js";
import {UserApiKeyController} from "./user-apikey.controller.js";
import {TypeOrmModule} from "@nestjs/typeorm";
import {UserApiKey} from "./userApiKey.entity.js";

@Module({
    imports: [TypeOrmModule.forFeature([UserApiKey]), UserInternalModule],
    controllers: [UserApiKeyController],
    providers: [UserApiKeyService],
    exports: [],
})
export class UserApiKeyModule {}
