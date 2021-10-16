import {registerAs} from "@nestjs/config";

export default registerAs("authclient", () => ({
    auth0Domain: process.env.AUTH0_DOMAIN,
}));
