/* eslint-disable unicorn/prefer-export-from */
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
import {EmailClientModule} from "./email-client/email-client.module";
import {EmailClient} from "./email-client/email-client.service";
import CoreLoggerService from "./logger/CoreLoggerService";
import {OrganisationModule} from "./organisation/organisation.module";
import {Person} from "./person/entities/person.entity";
import {PersonModule} from "./person/person.module";
import {PersonService} from "./person/person.service";
import {CoreModule} from "./root-app/core-app.module";
import {SwaggerGen} from "./root-app/SwaggerGen";

export {
    CoreLoggerService,
    CoreConfigurationService,
    EmailClientModule,
    CoreModule,
    SwaggerGen,
    DefaultAuthGuard,
    PostgresDatabaseModule as DatabaseModule,
    JwtStrategy,
    AuthzModule,
    Person,
    PostgresTypeOrmConfigurationProvider as TypeOrmConfigurationProvider,
    EmailClient,
    ValidatedConfigurationService,
    RequestWithUser,
    PersonModule,
    OrganisationModule,
    PersonService,
    SqliteDatabaseModule,
    SqliteDatabaseConfigurationService,
};
