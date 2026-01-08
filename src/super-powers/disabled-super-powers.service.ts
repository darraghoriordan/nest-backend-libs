import {Injectable} from "@nestjs/common";
import {BadRequestError} from "passport-headerapikey";

@Injectable()
 
export class DisabledSuperPowersService {
    resetDatabase(): Promise<void> {
        // eslint-disable-next-line @typescript-eslint/only-throw-error
        throw new BadRequestError("Super powers are disabled");
    }
}
