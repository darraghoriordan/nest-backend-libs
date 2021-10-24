import {Module} from "@nestjs/common";
import {PersonService} from "./person.service";
import {PersonController} from "./person.controller";
import {Person} from "./entities/person.entity";
import {LoggerModule} from "../logger/logger.module";
import {TypeOrmModule} from "@nestjs/typeorm";
import {AuthzClientModule} from "../authzclient/authz-client.module";
import {PersonConfigurationService} from "./PersonConfigurationService";
import {ConfigModule} from "@nestjs/config";
import configVariables from "./PersonConfigurationVariables";
@Module({
    imports: [
        ConfigModule.forFeature(configVariables),
        LoggerModule,
        TypeOrmModule.forFeature([Person]),
        AuthzClientModule,
    ],
    controllers: [PersonController],
    providers: [PersonService, PersonConfigurationService],
    exports: [PersonService],
})
export class PersonModule {}
