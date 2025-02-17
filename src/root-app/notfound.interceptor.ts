import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    NotFoundException,
    CallHandler,
} from "@nestjs/common";
import {Observable} from "rxjs";
import {tap} from "rxjs/operators";

@Injectable()
export class NotFoundInterceptor implements NestInterceptor {
    constructor(private errorMessage: string) {}

    intercept(
        context: ExecutionContext,
        stream$: CallHandler
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ): Observable<any> {
        return stream$.handle().pipe(
            tap((data) => {
                if (data === undefined) {
                    throw new NotFoundException(this.errorMessage);
                }
            })
        );
    }
}
