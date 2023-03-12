import {Injectable, Logger} from "@nestjs/common";
import {PassportStrategy} from "@nestjs/passport";
import {ExtractJwt, Strategy} from "passport-jwt";
import {passportJwtSecret} from "jwks-rsa";
import {AccessToken} from "../models/AccessToken.js";
import {Request} from "express";
import {AuthConfigurationService} from "../config/AuthConfigurationService.js";
import {RequestUser} from "../models/RequestWithUser.js";
import {UserValidationService} from "../services/UserValidation.service.js";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    private readonly logger = new Logger(JwtStrategy.name);
    constructor(
        private readonly userValidationService: UserValidationService,
        config: AuthConfigurationService
    ) {
        super({
            secretOrKeyProvider: passportJwtSecret({
                cache: true,
                rateLimit: true,
                jwksRequestsPerMinute: 5,
                jwksUri: `https://${config.auth0Domain}/.well-known/jwks.json`,
            }),
            passReqToCallback: true,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            audience: config.auth0Audience,
            issuer: `https://${config.auth0Domain}/`,
            algorithms: ["RS256"],
        });
    }

    async validate(
        request: Request,
        payload: AccessToken
    ): Promise<RequestUser | undefined> {
        const rawAccessToken =
            ExtractJwt.fromAuthHeaderAsBearerToken()(request);
        if (rawAccessToken === undefined || rawAccessToken === null) {
            this.logger.error("Couldn't log the raw access token");
            return;
        }

        const invitationId = request.query.invitationId as string;

        const userResult = await this.userValidationService.validateUser(
            payload,
            rawAccessToken,
            invitationId
        );

        const withPermissions = {permissions: payload.permissions || []};
        // eslint-disable-next-line sonarjs/prefer-immediate-return
        const rp = {...userResult, ...withPermissions} as RequestUser;
        return rp;
    }
}
