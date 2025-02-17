import {Injectable} from "@nestjs/common";
import {BadRequestError} from "passport-headerapikey";

@Injectable()
// eslint-disable-next-line @darraghor/nestjs-typed/injectable-should-be-provided
export class DisabledSuperPowersService {
    resetDatabase(): Promise<void> {
        // eslint-disable-next-line @typescript-eslint/only-throw-error
        throw new BadRequestError("Super powers are disabled");
    }
}
