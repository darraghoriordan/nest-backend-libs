import {User} from "../user-internal/entities/user.entity";
import {Request} from "express";
export interface RequestWithUser extends Request {
    user: RequestUser;
}
export type RequestUser = Pick<User, Exclude<keyof User, "nullChecks">> & {
    permissions: string[];
};
