import {Module} from "@nestjs/common";
import {UserInternalModule} from "../user-internal/user-internal.module";
import {UserApiKeyService} from "./user-apikey.service";
import {UserApiKeyController} from "./user-apikey.controller";
import {TypeOrmModule} from "@nestjs/typeorm";
import {UserApiKey} from "./userApiKey.entity";

@Module({
    imports: [TypeOrmModule.forFeature([UserApiKey]), UserInternalModule],
    controllers: [UserApiKeyController],
    providers: [UserApiKeyService],
    exports: [],
})
export class UserApiKeyModule {}
