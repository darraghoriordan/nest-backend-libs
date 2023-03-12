import {Inject, Injectable, Logger} from "@nestjs/common";
import type {AuthenticationClient} from "auth0";
import {UserProfile} from "./UserProfile.dto.js";
@Injectable()
export class AuthZClientService {
    private readonly logger = new Logger(AuthZClientService.name);
    constructor(
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
