import {forwardRef, Module} from "@nestjs/common";
import {PersonService} from "./person.service";
import {PersonController} from "./person.controller";
import {Person} from "./entities/person.entity";
import {LoggerModule} from "../logger/logger.module";
import {TypeOrmModule} from "@nestjs/typeorm";
import {AuthzClientModule} from "../authzclient/authz-client.module";
import {CoreModule} from "../root-app/core-app.module";

@Module({
    imports: [
        CoreModule,
        LoggerModule,
        TypeOrmModule.forFeature([Person]),
        forwardRef(() => AuthzClientModule), // forwardRef is needed to avoid circular dependency (AuthzClientModule imports PersonModule)
    ],
    controllers: [PersonController],
    providers: [PersonService],
    exports: [PersonService],
})
export class PersonModule {}
