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
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-call
        return new AuthenticationClient(options);
    },
    inject: [AuthClientConfigurationService],
};
