import {Person} from "../person/entities/person.entity";
import {Request} from "express";
export interface RequestWithUser extends Request {
    user: RequestPerson;
}
export type RequestPerson = Pick<
    Person,
    Exclude<keyof Person, "nullChecks">
> & {
    permissions: string[];
};
