/* eslint-disable unicorn/prefer-export-from */
import {RunningCommandLineModule} from "./runningCommandLine/RunningCommandLine.module";
import {TwitterAccountModule} from "./twitter-client/twitter-account.module";
import {SmtpEmailClientModule} from "./smtp-email-client/smtp-email-client.module";
import {EUploadMimeType} from "twitter-api-v2";
import {ValidatedConfigurationService} from "./configuration/ValidatedConfigurationService";
import {CoreConfigurationService} from "./core-config/CoreConfigurationService";
import {PostgresDatabaseModule} from "./database-postgres/PostgresDatabase.module";
import {PostgresTypeOrmConfigurationProvider} from "./database-postgres/PostgresTypeOrmConfigurationProvider";
import {SqliteDatabaseModule} from "./database-sqlite/SqliteDatabase.module";
import {SqliteDatabaseConfigurationService} from "./database-sqlite/SqliteDatabaseConfigurationService";
import {SmtpEmailClient} from "./smtp-email-client/email-client.service";
import {CoreModule} from "./root-app/core-app.module";
import {SwaggerGen} from "./root-app/SwaggerGen";
import {TwitterClientService} from "./twitter-client/services/twitter-client.service";
import {CoreConfigModule} from "./core-config/CoreConfig.module";
import {CliCommandService} from "./runningCommandLine/CliCommandService";

export {
    CoreConfigurationService,
    SmtpEmailClientModule,
    CoreModule,
    CoreConfigModule,
    SwaggerGen,
    PostgresDatabaseModule as DatabaseModule,
    PostgresTypeOrmConfigurationProvider as TypeOrmConfigurationProvider,
    SmtpEmailClient,
    ValidatedConfigurationService,
    SqliteDatabaseModule,
    SqliteDatabaseConfigurationService,
    TwitterClientService,
    TwitterAccountModule,
    EUploadMimeType,
    RunningCommandLineModule,
    CliCommandService,
};

export * from "./stripe-client/index";
export * from "./organisation-memberships/index";
export * from "./organisation-subscriptions/index";
export * from "./organisation/index";
export * from "./authz/index";
export * from "./invitations/index";
export * from "./user-internal/index";
export * from "./user-external/index";
export * from "./user-api-key/index";
