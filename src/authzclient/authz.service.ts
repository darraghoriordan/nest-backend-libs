import {Inject, Injectable} from "@nestjs/common";
import {AuthenticationClient} from "auth0";
import CoreLoggerService from "../logger/CoreLoggerService";
import {UserProfile} from "./UserProfile.dto";
@Injectable()
export class AuthZClientService {
    constructor(
        private readonly logger: CoreLoggerService,
        @Inject("AuthzClient")
        private readonly auth0Client: AuthenticationClient
    ) {}

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
