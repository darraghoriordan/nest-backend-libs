import {forwardRef, Module} from "@nestjs/common";
import {PersonService} from "./person.service";
import {PersonController} from "./person.controller";
import {Person} from "./entities/person.entity";
import {LoggerModule} from "../logger/logger.module";
import {TypeOrmModule} from "@nestjs/typeorm";
import {CoreModule} from "../root-app/core-app.module";
import {AuthzModule} from "../authz";
import {AuthzClientModule} from "../authzclient/authz-client.module";

@Module({
    imports: [
        CoreModule,
        LoggerModule,
        TypeOrmModule.forFeature([Person]),
        AuthzClientModule,
        forwardRef(() => AuthzModule), // forwardRef is needed to avoid circular dependency (AuthzClientModule imports PersonModule)
    ],
    controllers: [PersonController],
    providers: [PersonService],
    exports: [PersonService],
})
export class PersonModule {}
