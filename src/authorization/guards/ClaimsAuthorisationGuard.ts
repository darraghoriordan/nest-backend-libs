import {
    CanActivate,
    ExecutionContext,
    Injectable,
    Logger,
} from "@nestjs/common";
import {Observable} from "rxjs";
import {Reflector} from "@nestjs/core";
import {RequestWithUser} from "../models/RequestWithUser.js";

@Injectable()
export class ClaimsAuthorisationGuard implements CanActivate {
    private readonly logger = new Logger(ClaimsAuthorisationGuard.name);

    constructor(private readonly reflector: Reflector) {}

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

            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            if (!routePermissions || routePermissions.length === 0) {
                return true;
            }

            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            if (!user?.permissions) {
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
