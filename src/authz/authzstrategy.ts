import {Injectable} from "@nestjs/common";
import {PassportStrategy} from "@nestjs/passport";
import {ExtractJwt, Strategy} from "passport-jwt";
import {passportJwtSecret} from "jwks-rsa";
import {PersonService} from "../person/person.service";
import {AccessToken} from "./AccessToken";
import {Request} from "express";
import {AuthConfigurationService} from "./AuthConfigurationService";
import CoreLoggerService from "../logger/CoreLoggerService";
import {RequestPerson} from "./RequestWithUser";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    private readonly _config: AuthConfigurationService;

    constructor(
        private readonly personService: PersonService,
        private readonly logger: CoreLoggerService,
        config: AuthConfigurationService
    ) {
        super({
            secretOrKeyProvider: passportJwtSecret({
                cache: true,
                rateLimit: true,
                jwksRequestsPerMinute: 5,
                jwksUri: `${config.auth0IssuerUrl}.well-known/jwks.json`,
            }),
            passReqToCallback: true,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            audience: config.auth0Audience,
            issuer: config.auth0IssuerUrl,
            algorithms: ["RS256"],
        });
        this._config = config;

        console.debug("Config usage", this._config.auth0IssuerUrl);
    }

    async validate(
        request: Request,
        payload: AccessToken
    ): Promise<RequestPerson | undefined> {
        const rawAccessToken =
            ExtractJwt.fromAuthHeaderAsBearerToken()(request);
        if (rawAccessToken === undefined || rawAccessToken === null) {
            this.logger.error("Couldn't log the raw access token");
            return;
        }

        const personResult = await this.personService.validateUser(
            payload,
            rawAccessToken
        );
        const withPermissions = {permissions: payload.permissions || []};
        return {...personResult, ...withPermissions} as RequestPerson;
    }
}
