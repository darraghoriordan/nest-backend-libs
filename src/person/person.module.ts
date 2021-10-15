import {Module} from "@nestjs/common";
import {PersonService} from "./person.service";
import {PersonController} from "./person.controller";
import {Person} from "./entities/person.entity";
import {LoggerModule} from "../logger/logger.module";
import {TypeOrmModule} from "@nestjs/typeorm";
import {AuthzModule} from "../authz/authz.module";

@Module({
    imports: [LoggerModule, TypeOrmModule.forFeature([Person]), AuthzModule],
    controllers: [PersonController],
    providers: [PersonService],
    exports: [PersonService],
})
export class PersonModule {}
