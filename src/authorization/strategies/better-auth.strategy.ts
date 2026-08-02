import {Injectable, Logger, UnauthorizedException} from "@nestjs/common";
import {PassportStrategy} from "@nestjs/passport";
import {Strategy} from "passport";
import type {Request} from "express";
import {BetterAuthConfigurationService} from "../config/BetterAuthConfigurationService.js";
import type {RequestUser} from "../models/RequestWithUser.js";
import {BetterAuthUserValidationService} from "../services/BetterAuthUserValidation.service.js";

@Injectable()
export class BetterAuthStrategy extends PassportStrategy(Strategy, "jwt") {
    private readonly logger = new Logger(BetterAuthStrategy.name);

    constructor(
        private readonly config: BetterAuthConfigurationService,
        private readonly userValidation: BetterAuthUserValidationService
    ) {
        super();
    }

    validate(): never {
        throw new Error(
            "BetterAuthStrategy validates sessions in authenticate()"
        );
    }

    override async authenticate(request: Request): Promise<void> {
        try {
            const profile = await this.config.resolveUser(request);
            if (!profile) {
                this.fail(new UnauthorizedException("Authentication required"));
                return;
            }

            const invitationId =
                typeof request.query.invitationId === "string"
                    ? request.query.invitationId
                    : undefined;
            const user: RequestUser = await this.userValidation.validateUser(
                profile,
                invitationId
            );
            this.success(user);
        } catch (error) {
            this.logger.warn("Better Auth session validation failed");
            this.error(
                error instanceof Error
                    ? error
                    : new UnauthorizedException("Authentication failed")
            );
        }
    }
}
