import {Module} from "@nestjs/common";
import {PersonController} from "./person.controller";
import {PersonInternalModule} from "../person-internal/person-internal.module";

@Module({
    imports: [PersonInternalModule],
    controllers: [PersonController],
    providers: [],
    exports: [],
})
export class PersonExternalModule {}
