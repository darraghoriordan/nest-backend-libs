import {registerAs} from "@nestjs/config";

export default registerAs("core", () => ({
    loggerName: process.env.LOGGER_NAME,
    shouldGenerateSwagger: process.env.GENERATE_SWAGGER,
    webPort: process.env.WEB_PORT,
    nodeEnv: process.env.NODE_ENV,
    frontEndAppUrl: process.env.FRONTEND_APP_URL,
    shouldUseNestCors: process.env.ENABLE_NEST_CORS,
    shouldAutomaticallyInstallApiModels: process.env.AUTO_INSTALL_API_MODELS,
    appTitle: process.env.APP_TITLE,
}));
