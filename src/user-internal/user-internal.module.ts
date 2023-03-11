import {Module} from "@nestjs/common";
import {UserService} from "../user-internal/user.service";
import {User} from "../user-internal/entities/user.entity";
import {TypeOrmModule} from "@nestjs/typeorm";

@Module({
    imports: [TypeOrmModule.forFeature([User])],
    providers: [UserService],
    exports: [UserService],
})
export class UserInternalModule {}
