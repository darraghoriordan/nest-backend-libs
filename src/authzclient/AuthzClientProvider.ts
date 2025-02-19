import {AuthenticationClient} from "auth0";

import {AuthClientConfigurationService} from "./AuthClientConfigurationService.js";
import type {AuthenticationClientOptions} from "auth0";
export const AuthzClientProvider = {
    provide: "AuthzClient",
    useFactory: (config: AuthClientConfigurationService) => {
        const options: AuthenticationClientOptions = {
            domain: config.auth0Domain,
            clientId: config.auth0Domain,
        };

        return new AuthenticationClient(options);
    },
    inject: [AuthClientConfigurationService],
};
