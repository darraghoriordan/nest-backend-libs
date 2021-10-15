import {Module} from "@nestjs/common";
import {OrganisationService} from "./organisation.service";
import {OrganisationController} from "./organisation.controller";
import {LoggerModule} from "../logger/logger.module";
import {TypeOrmModule} from "@nestjs/typeorm";
import {Organisation} from "./entities/organisation.entity";

@Module({
    imports: [LoggerModule, TypeOrmModule.forFeature([Organisation])],
    controllers: [OrganisationController],
    providers: [OrganisationService],
    exports: [OrganisationService],
})
export class OrganisationModule {}
