/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
    CallHandler,
    ExecutionContext,
    Injectable,
    Logger,
    NestInterceptor,
} from "@nestjs/common";
import {tap} from "rxjs/operators";
import {Request} from "express";

@Injectable()
export class HttpLogResponse implements NestInterceptor {
    private logger = new Logger("HTTP");

    intercept(context: ExecutionContext, next: CallHandler) {
        const request: Request = context.switchToHttp().getRequest();

        const response = context.switchToHttp().getResponse();

        const {originalUrl, method, params, query, body} = request;

        this.logger.log({
            type: "REQUEST",
            originalUrl,
            method,
            params: params || undefined,
            query: query || undefined,
            body: body || undefined,
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
