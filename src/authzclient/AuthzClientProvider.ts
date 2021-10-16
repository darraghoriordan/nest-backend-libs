import {AuthenticationClient, AuthenticationClientOptions} from "auth0";
import {AuthClientConfigurationService} from "./AuthClientConfigurationService";

export const AuthzClientProvider = {
    provide: "AuthzClient",
    useFactory: (config: AuthClientConfigurationService) => {
        const options: AuthenticationClientOptions = {
            domain: config.auth0Domain,
        };
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-call
        return new AuthenticationClient(options);
    },
    inject: [AuthClientConfigurationService],
};
