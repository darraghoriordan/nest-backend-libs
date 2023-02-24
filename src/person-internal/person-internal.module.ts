import {Module} from "@nestjs/common";
import {PersonService} from "../person-internal/person.service";
import {Person} from "../person-internal/entities/person.entity";
import {TypeOrmModule} from "@nestjs/typeorm";

@Module({
    imports: [TypeOrmModule.forFeature([Person])],
    controllers: [],
    providers: [PersonService],
    exports: [PersonService],
})
export class PersonInternalModule {}
