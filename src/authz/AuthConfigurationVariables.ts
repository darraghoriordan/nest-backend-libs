import {registerAs} from "@nestjs/config";

export default registerAs("auth", () => ({
    auth0Domain: process.env.AUTH0_DOMAIN,
    auth0audience: process.env.AUTH0_AUDIENCE,
}));
