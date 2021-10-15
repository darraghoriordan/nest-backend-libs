import {registerAs} from "@nestjs/config";

export default registerAs("authClient", () => ({
    auth0Domain: process.env.AUTH0_DOMAIN,
}));
