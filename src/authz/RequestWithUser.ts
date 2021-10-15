import {Person} from "../person/entities/person.entity";

export interface RequestWithUser extends Request {
    user: Person;
}
