import {AuthzModule} from "./authz/authz.module";
import {JwtStrategy} from "./authz/authzstrategy";
import {DefaultAuthGuard} from "./authz/DefaultAuthGuard";
import {RequestWithUser} from "./authz/RequestWithUser";
import {ValidatedConfigurationService} from "./configuration/ValidatedConfigurationService";
import {CoreConfigurationService} from "./core-config/CoreConfigurationService";
import {DatabaseModule} from "./database/Database.module";
import {TypeOrmConfigurationProvider} from "./database/TypeOrmConfigurationProvider";
import {EmailClientModule} from "./email-client/email-client.module";
import {EmailClient} from "./email-client/email-client.service";
import CoreLoggerService from "./logger/CoreLoggerService";
import {OrganisationModule} from "./organisation/organisation.module";
import {Person} from "./person/entities/person.entity";
import {PersonModule} from "./person/person.module";
import {CoreModule} from "./root-app/core-app.module";
import {SwaggerGen} from "./root-app/SwaggerGen";

export {
    CoreLoggerService,
    CoreConfigurationService,
    EmailClientModule,
    CoreModule,
    SwaggerGen,
    DefaultAuthGuard,
    DatabaseModule,
    JwtStrategy,
    AuthzModule,
    Person,
    TypeOrmConfigurationProvider,
    EmailClient,
    ValidatedConfigurationService,
    RequestWithUser,
    PersonModule,
    OrganisationModule,
};
