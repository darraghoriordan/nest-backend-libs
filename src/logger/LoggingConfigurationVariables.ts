import {registerAs} from "@nestjs/config";

export default registerAs("logging", () => ({
    nodeEnv: process.env.NODE_ENV,
    loggerName: process.env.LOGGER_NAME,
    loggerMinLevel: process.env.LOGGER_MIN_LEVEL,
    usePrettyLogs: process.env.LOGGER_USE_PRETTY_LOGS,
}));
