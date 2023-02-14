import {Injectable, Logger} from "@nestjs/common";
import {PassportStrategy} from "@nestjs/passport";
import {ExtractJwt, Strategy} from "passport-jwt";
import {passportJwtSecret} from "jwks-rsa";
import {PersonService} from "../person/person.service";
import {AccessToken} from "./AccessToken";
import {Request} from "express";
import {AuthConfigurationService} from "./AuthConfigurationService";
import {RequestPerson} from "./RequestWithUser";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    // private readonly _config: AuthConfigurationService;
    private readonly logger = new Logger(JwtStrategy.name);
    constructor(
        private readonly personService: PersonService,
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
        // eslint-disable-next-line sonarjs/prefer-immediate-return
        const rp = {...personResult, ...withPermissions} as RequestPerson;
        return rp;
    }
}
