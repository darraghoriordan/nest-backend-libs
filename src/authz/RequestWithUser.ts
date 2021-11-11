import {Person} from "../person/entities/person.entity";
import {Request} from "express";
export interface RequestWithUser extends Request {
    user: Person;
}
