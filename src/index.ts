import {AuthzModule} from "./authz/authz.module";
import {JwtStrategy} from "./authz/authzstrategy";
import {DefaultAuthGuard} from "./authz/DefaultAuthGuard";
import {ValidatedConfigurationService} from "./configuration/ValidatedConfigurationService";
import {CoreConfigurationService} from "./core-config/CoreConfigurationService";
import {DatabaseModule} from "./database/Database.module";
import {TypeOrmConfigurationProvider} from "./database/TypeOrmConfigurationProvider";
import {EmailClient} from "./email-client/email-client.service";
import CoreLoggerService from "./logger/CoreLoggerService";
import {AppModule} from "./root-app/app.module";
import {SwaggerGen} from "./root-app/SwaggerGen";

export {
    CoreLoggerService,
    CoreConfigurationService,
    AppModule,
    SwaggerGen,
    DefaultAuthGuard,
    DatabaseModule,
    JwtStrategy,
    AuthzModule,
    TypeOrmConfigurationProvider,
    EmailClient,
    ValidatedConfigurationService,
};
