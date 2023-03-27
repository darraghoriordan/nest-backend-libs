import {User} from "../../user/entities/user.entity.js";
import {Request} from "express";
export interface RequestWithUser extends Request {
    user: RequestUser;
}
export type RequestUser = Pick<User, Exclude<keyof User, "nullChecks">> & {
    permissions: string[];
    activeSubscriptionProductKeys: string[];
};
