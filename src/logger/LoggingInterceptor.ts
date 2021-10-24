/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
} from "@nestjs/common";
import {tap} from "rxjs";
import CoreLoggerService from "./CoreLoggerService";

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    constructor(private readonly logger: CoreLoggerService) {}
    intercept(context: ExecutionContext, next: CallHandler) {
        const request = context.switchToHttp().getRequest();

        const response = context.switchToHttp().getResponse();

        const {originalUrl, method, params, query, body} = request;

        this.logger.log({
            type: "REQUEST",
            originalUrl,
            method,
            params,
            query,
            body,
        });

        return next.handle().pipe(
            tap((data) =>
                this.logger.log({
                    type: "RESPONSE",
                    originalUrl,
                    method,
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                    status: response?.status,
                    responseBody: data || undefined,
                })
            )
        );
    }
}
