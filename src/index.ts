/* eslint-disable unicorn/prefer-export-from */
import {SmtpEmailClientModule} from "./smtp-email-client/smtp-email-client.module";
import {EUploadMimeType} from "twitter-api-v2";
import {AuthzModule} from "./authz/authz.module";
import {JwtStrategy} from "./authz/authzstrategy";
import {DefaultAuthGuard} from "./authz/DefaultAuthGuard";
import {RequestWithUser} from "./authz/RequestWithUser";
import {ValidatedConfigurationService} from "./configuration/ValidatedConfigurationService";
import {CoreConfigurationService} from "./core-config/CoreConfigurationService";
import {PostgresDatabaseModule} from "./database-postgres/PostgresDatabase.module";
import {PostgresTypeOrmConfigurationProvider} from "./database-postgres/PostgresTypeOrmConfigurationProvider";
import {SqliteDatabaseModule} from "./database-sqlite/SqliteDatabase.module";
import {SqliteDatabaseConfigurationService} from "./database-sqlite/SqliteDatabaseConfigurationService";
import {SmtpEmailClient} from "./smtp-email-client/email-client.service";
import CoreLoggerService from "./logger/CoreLoggerService";
import {OrganisationModule} from "./organisation/organisation.module";
import {Person} from "./person/entities/person.entity";
import {PersonModule} from "./person/person.module";
import {PersonService} from "./person/person.service";
import {CoreModule} from "./root-app/core-app.module";
import {SwaggerGen} from "./root-app/SwaggerGen";
import {TwitterClientService} from "./twitter-client/services/twitter-client.service";

export {
    CoreLoggerService,
    CoreConfigurationService,
    SmtpEmailClientModule,
    CoreModule,
    SwaggerGen,
    DefaultAuthGuard,
    PostgresDatabaseModule as DatabaseModule,
    JwtStrategy,
    AuthzModule,
    Person,
    PostgresTypeOrmConfigurationProvider as TypeOrmConfigurationProvider,
    SmtpEmailClient,
    ValidatedConfigurationService,
    RequestWithUser,
    PersonModule,
    OrganisationModule,
    PersonService,
    SqliteDatabaseModule,
    SqliteDatabaseConfigurationService,
    TwitterClientService,
    EUploadMimeType,
};
