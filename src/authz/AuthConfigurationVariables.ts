import {registerAs} from "@nestjs/config";

export default registerAs("auth", () => ({
    auth0Domain: process.env.AUTH0_DOMAIN,
    auth0issuerUrl: process.env.AUTH0_ISSUER_URL,
    auth0audience: process.env.AUTH0_AUDIENCE,
}));
