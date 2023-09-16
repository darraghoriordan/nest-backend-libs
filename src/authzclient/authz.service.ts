import {Inject, Injectable, Logger} from "@nestjs/common";
import type {UserInfoClient, UserInfoResponse} from "auth0";

@Injectable()
export class AuthZClientService {
    private readonly logger = new Logger(AuthZClientService.name);
    constructor(
        @Inject("AuthzUserInfoClient")
        private readonly auth0Client: UserInfoClient
    ) {}

    public async getUser(
        accessToken: string
    ): Promise<UserInfoResponse | undefined> {
        try {
            this.logger.debug("Attempting to get auth0 profile", accessToken);

            const result = await this.auth0Client.getUserInfo(accessToken);
            return result.data;
        } catch (error) {
            this.logger.error("Failed to load user from auth0", error);
        }
        return undefined;
    }
}
