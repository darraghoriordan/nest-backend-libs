import {UserInfoClient} from "auth0";
import {AuthClientConfigurationService} from "./AuthClientConfigurationService.js";
export const AuthzUserInfoProvider = {
    provide: "AuthzUserInfoClient",
    useFactory: (config: AuthClientConfigurationService): UserInfoClient => {
        const options = {
            domain: config.auth0Domain,
        };

        return new UserInfoClient(options);
    },
    inject: [AuthClientConfigurationService],
};
