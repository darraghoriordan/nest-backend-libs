import {registerAs} from "@nestjs/config";

export default registerAs("authclient", () => ({
    auth0Domain: process.env.AUTH0_DOMAIN,
    auth0ClientId: process.env.AUTH0_CLIENT_ID,
}));
