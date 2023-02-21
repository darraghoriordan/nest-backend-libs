import {Module} from "@nestjs/common";
import {PersonService} from "./person.service";
import {PersonController} from "./person.controller";
import {Person} from "./entities/person.entity";
import {TypeOrmModule} from "@nestjs/typeorm";

@Module({
    imports: [TypeOrmModule.forFeature([Person])],
    controllers: [PersonController],
    providers: [PersonService],
    exports: [PersonService],
})
export class PersonModule {}
