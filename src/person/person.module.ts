import {Module} from "@nestjs/common";
import {PersonService} from "./person.service";
import {PersonController} from "./person.controller";
import {Person} from "./entities/person.entity";
import {LoggerModule} from "../logger/logger.module";
import {TypeOrmModule} from "@nestjs/typeorm";
import {CoreModule} from "../root-app/core-app.module";
import {AuthzModule} from "../authz";

@Module({
    imports: [
        CoreModule,
        AuthzModule,
        LoggerModule,
        TypeOrmModule.forFeature([Person]),
    ],
    controllers: [PersonController],
    providers: [PersonService],
    exports: [PersonService],
})
export class PersonModule {}
