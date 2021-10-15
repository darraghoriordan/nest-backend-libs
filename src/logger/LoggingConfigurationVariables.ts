import {registerAs} from "@nestjs/config";

export default registerAs("logging", () => ({
    nodeEnv: process.env.NODE_ENV,
    loggerName: process.env.LOGGER_NAME,
}));
