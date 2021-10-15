import {Injectable} from "@nestjs/common";
import {AuthenticationClient, AuthenticationClientOptions} from "auth0";
import CoreLoggerService from "../logger/CoreLoggerService";
import {AuthClientConfigurationService} from "./AuthClientConfigurationService";
import {UserProfile} from "./UserProfile.dto";
@Injectable()
export class AuthZClientService {
    private auth0Client: AuthenticationClient;

    constructor(
        private readonly logger: CoreLoggerService,
        private readonly config: AuthClientConfigurationService
    ) {
        const options: AuthenticationClientOptions = {
            domain: this.config.auth0Domain,
        };
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-call
        this.auth0Client = new AuthenticationClient(options);
    }

    public async getUser(
        accessToken: string
    ): Promise<UserProfile | undefined> {
        try {
            this.logger.debug("Attempting to get auth0 profile", accessToken);

            return (await this.auth0Client.getProfile(
                accessToken
            )) as Promise<UserProfile>;
        } catch (error) {
            this.logger.error("Failed to load user from auth0", error);
        }
        return undefined;
    }
}
