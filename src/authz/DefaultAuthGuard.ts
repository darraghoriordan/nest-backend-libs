import {Injectable} from "@nestjs/common";
import {AuthGuard} from "@nestjs/passport";

@Injectable()
// eslint-disable-next-line @darraghor/nestjs-typed/injectable-should-be-provided
export class DefaultAuthGuard extends AuthGuard("jwt") {
    constructor() {
        super();
    }
}
