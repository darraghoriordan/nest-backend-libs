import {registerAs} from "@nestjs/config";

export default registerAs("invitations", () => ({
    baseUrl: process.env.INVITATION_URLS_BASE_URL,
}));
