import {CanActivate, ExecutionContext, Injectable} from "@nestjs/common";
import {Observable} from "rxjs";
import {Reflector} from "@nestjs/core";
import {RequestWithUser} from "./RequestWithUser";
import CoreLoggerService from "../logger/CoreLoggerService";

@Injectable()
export class ClaimsAuthorisationGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        private readonly logger: CoreLoggerService
    ) {}

    canActivate(
        context: ExecutionContext
    ): boolean | Promise<boolean> | Observable<boolean> {
        try {
            const routePermissions = this.reflector.get<string[]>(
                "mandatoryUserClaims",
                context.getHandler()
            );

            const httpContext = context
                .switchToHttp()
                .getRequest<RequestWithUser>();
            const user = httpContext.user;

            if (!routePermissions || routePermissions.length === 0) {
                return true;
            }

            if (!user || !user.permissions) {
                return false;
            }
            return routePermissions.every((routePermission) =>
                user.permissions.includes(routePermission)
            );
        } catch (error) {
            this.logger.error(`Authorization failed`, error);
            return false;
        }
    }
}
