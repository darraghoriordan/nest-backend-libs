# Upgrade Guide: Migrating to forRootAsync Configuration

This guide helps you migrate from environment variable-based configuration to the new `forRootAsync` pattern.

## Breaking Changes

All modules in this library now require explicit configuration via `forRootAsync()`. Environment variables are no longer read automatically.

## Migration Steps

### 1. Update your package

```bash
pnpm update @darraghor/nest-backend-libs
```

### 2. Create a configuration file

Create `src/config/library.config.ts` to centralize your library configuration:

```typescript
import {ConfigService} from "@nestjs/config";
import {
    CoreModuleOptions,
    LoggerModuleOptions,
    AuthzModuleOptions,
    AuthzClientModuleOptions,
    StripeModuleOptions,
    SmtpEmailModuleOptions,
    TwitterModuleOptions,
    InvitationModuleOptions,
} from "@darraghor/nest-backend-libs";

export const createCoreConfig = (config: ConfigService): CoreModuleOptions => ({
    webPort: config.get<number>("WEB_PORT") ?? 3000,
    appTitle: config.get<string>("APP_TITLE") ?? "My App",
    frontEndAppUrl: config.get<string>("FRONTEND_APP_URL")!,
    nodeEnv: config.get<string>("NODE_ENV") ?? "development",
    bullQueueHost: config.get<string>("REDIS_URL")!,
    shouldGenerateSwagger: config.get<string>("GENERATE_SWAGGER") === "true",
    shouldAutomaticallyInstallApiModels:
        config.get<string>("AUTO_INSTALL_API_MODELS") === "true",
    shouldUseNestCors: config.get<string>("ENABLE_NEST_CORS") === "true",
    globalPrefix: config.get<string>("APP_GLOBAL_PREFIX"),
});

export const createLoggerConfig = (
    config: ConfigService
): LoggerModuleOptions => ({
    nodeEnv: config.get<string>("NODE_ENV") ?? "development",
    loggerName: config.get<string>("LOGGER_NAME"),
    minLevel: config.get<string>("LOGGER_MIN_LEVEL") ?? "debug",
    usePrettyLogs: config.get<string>("LOGGER_USE_PRETTY_LOGS") === "true",
});

export const createAuthzConfig = (
    config: ConfigService
): AuthzModuleOptions => ({
    auth0Audience: config.get<string>("AUTH0_AUDIENCE")!,
    auth0Domain: config.get<string>("AUTH0_DOMAIN")!,
    superUserIds:
        config
            .get<string>("SUPER_USER_IDS")
            ?.split(",")
            .map((s) => s.trim())
            .filter(Boolean) ?? [],
});

export const createAuthzClientConfig = (
    config: ConfigService
): AuthzClientModuleOptions => ({
    auth0Domain: config.get<string>("AUTH0_DOMAIN")!,
    auth0ClientId: config.get<string>("AUTH0_CLIENT_ID")!,
});

export const createStripeConfig = (
    config: ConfigService
): StripeModuleOptions => ({
    accessToken: config.get<string>("STRIPE_ACCESS_TOKEN")!,
    webhookVerificationKey: config.get<string>(
        "STRIPE_WEBHOOK_VERIFICATION_KEY"
    )!,
    stripeRedirectsBaseUrl: config.get<string>("STRIPE_REDIRECTS_BASE_URL")!,
});

export const createSmtpEmailConfig = (
    config: ConfigService
): SmtpEmailModuleOptions => ({
    smtpHost: config.get<string>("SMTP_EMAIL_HOST")!,
    smtpPort: config.get<number>("SMTP_EMAIL_PORT") ?? 587,
    emailUsername: config.get<string>("SMTP_EMAIL_USERNAME")!,
    emailPassword: config.get<string>("SMTP_EMAIL_PASSWORD")!,
    senderEmailAddress: config.get<string>("EMAIL_SENDER_ADDRESS")!,
    senderName: config.get<string>("EMAIL_SENDER_NAME")!,
    extraEmailBcc: config.get<string>("EXTRA_EMAIL_BCC") ?? "",
    isEmailSyncSendEnabled:
        config.get<string>("EMAIL_SYNC_SEND_ENABLED") === "true",
});

export const createTwitterConfig = (
    config: ConfigService
): TwitterModuleOptions => ({
    appKey: config.get<string>("TWITTER_APP_KEY")!,
    appSecret: config.get<string>("TWITTER_APP_SECRET")!,
    accessToken: config.get<string>("TWITTER_ACCESS_TOKEN")!,
    accessSecret: config.get<string>("TWITTER_ACCESS_SECRET")!,
});

export const createInvitationConfig = (
    config: ConfigService
): InvitationModuleOptions => ({
    baseUrl: config.get<string>("INVITATION_URLS_BASE_URL")!,
});
```

### 3. Update your AppModule

Replace static module imports with `forRootAsync()` calls.

#### Before (old pattern):

```typescript
import {Module} from "@nestjs/common";
import {ConfigModule} from "@nestjs/config";
import {
    CoreModule,
    AuthzModule,
    StripeAccountModule,
} from "@darraghor/nest-backend-libs";

@Module({
    imports: [
        ConfigModule.forRoot({isGlobal: true}),
        CoreModule,
        AuthzModule,
        StripeAccountModule,
    ],
})
export class AppModule {}
```

#### After (new pattern):

```typescript
import {Module} from "@nestjs/common";
import {ConfigModule, ConfigService} from "@nestjs/config";
import {
    CoreModule,
    AuthzModule,
    AuthzClientModule,
    StripeAccountModule,
} from "@darraghor/nest-backend-libs";
import {
    createCoreConfig,
    createLoggerConfig,
    createAuthzConfig,
    createAuthzClientConfig,
    createStripeConfig,
} from "./config/library.config";

@Module({
    imports: [
        ConfigModule.forRoot({isGlobal: true}),

        CoreModule.forRootAsync({
            core: {
                imports: [ConfigModule],
                inject: [ConfigService],
                useFactory: createCoreConfig,
            },
            logger: {
                imports: [ConfigModule],
                inject: [ConfigService],
                useFactory: createLoggerConfig,
            },
        }),

        AuthzModule.forRootAsync({
            imports: [
                ConfigModule,
                AuthzClientModule.forRootAsync({
                    imports: [ConfigModule],
                    inject: [ConfigService],
                    useFactory: createAuthzClientConfig,
                }),
            ],
            inject: [ConfigService],
            useFactory: createAuthzConfig,
        }),

        StripeAccountModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: createStripeConfig,
        }),
    ],
})
export class AppModule {}
```

### 4. Module-specific migration

#### CoreModule

The `CoreModule` now requires both `core` and `logger` configuration:

```typescript
CoreModule.forRootAsync({
  core: {
    imports: [ConfigModule],
    inject: [ConfigService],
    useFactory: (config: ConfigService) => ({
      webPort: config.get<number>('WEB_PORT') ?? 3000,
      appTitle: config.get<string>('APP_TITLE')!,
      frontEndAppUrl: config.get<string>('FRONTEND_APP_URL')!,
      nodeEnv: config.get<string>('NODE_ENV')!,
      bullQueueHost: config.get<string>('REDIS_URL')!,
      shouldGenerateSwagger: config.get<string>('GENERATE_SWAGGER') === 'true',
      shouldAutomaticallyInstallApiModels: false,
      shouldUseNestCors: true,
      globalPrefix: 'api', // optional
    }),
  },
  logger: {
    imports: [ConfigModule],
    inject: [ConfigService],
    useFactory: (config: ConfigService) => ({
      nodeEnv: config.get<string>('NODE_ENV')!,
      loggerName: 'MyApp',
      minLevel: 'debug',
      usePrettyLogs: config.get<string>('NODE_ENV') === 'development',
    }),
  },
}),
```

#### AuthzModule

`AuthzModule` no longer automatically imports `AuthzClientModule`. You must provide it:

```typescript
AuthzModule.forRootAsync({
  imports: [
    AuthzClientModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        auth0Domain: config.get<string>('AUTH0_DOMAIN')!,
        auth0ClientId: config.get<string>('AUTH0_CLIENT_ID')!,
      }),
    }),
  ],
  inject: [ConfigService],
  useFactory: (config: ConfigService) => ({
    auth0Audience: config.get<string>('AUTH0_AUDIENCE')!,
    auth0Domain: config.get<string>('AUTH0_DOMAIN')!,
    superUserIds: config.get<string>('SUPER_USER_IDS')?.split(',') ?? [],
  }),
}),
```

#### InvitationModule

`InvitationModule` no longer automatically imports `SmtpEmailClientModule`. You must provide it via imports if needed:

```typescript
InvitationModule.forRootAsync({
  imports: [
    SmtpEmailClientModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: createSmtpEmailConfig,
    }),
  ],
  inject: [ConfigService],
  useFactory: (config: ConfigService) => ({
    baseUrl: config.get<string>('INVITATION_URLS_BASE_URL')!,
  }),
}),
```

### 5. Database modules (unchanged)

`PostgresDatabaseModule` and `SqliteDatabaseModule` still use environment variables and are imported the same way:

```typescript
import { DatabaseModule } from '@darraghor/nest-backend-libs';

@Module({
  imports: [
    DatabaseModule, // Still uses env vars
  ],
})
```

### 6. Environment variables reference

Your `.env` file should still contain these variables (they're now read via ConfigService):

```env
# Core
WEB_PORT=3000
APP_TITLE=My Application
FRONTEND_APP_URL=http://localhost:3001
NODE_ENV=development
REDIS_URL=redis://localhost:6379
GENERATE_SWAGGER=true
AUTO_INSTALL_API_MODELS=false
ENABLE_NEST_CORS=true
APP_GLOBAL_PREFIX=api

# Logger
LOGGER_NAME=MyApp
LOGGER_MIN_LEVEL=debug
LOGGER_USE_PRETTY_LOGS=true

# Auth
AUTH0_DOMAIN=your-tenant.auth0.com
AUTH0_AUDIENCE=https://your-api.com
AUTH0_CLIENT_ID=your-client-id
SUPER_USER_IDS=user1,user2

# Stripe (if using StripeAccountModule)
STRIPE_ACCESS_TOKEN=sk_test_xxx
STRIPE_WEBHOOK_VERIFICATION_KEY=whsec_xxx
STRIPE_REDIRECTS_BASE_URL=http://localhost:3001

# Email (if using SmtpEmailClientModule)
SMTP_EMAIL_HOST=smtp.example.com
SMTP_EMAIL_PORT=587
SMTP_EMAIL_USERNAME=user@example.com
SMTP_EMAIL_PASSWORD=password
EMAIL_SENDER_ADDRESS=noreply@example.com
EMAIL_SENDER_NAME=My App
EXTRA_EMAIL_BCC=
EMAIL_SYNC_SEND_ENABLED=false

# Twitter (if using TwitterAccountModule)
TWITTER_APP_KEY=xxx
TWITTER_APP_SECRET=xxx
TWITTER_ACCESS_TOKEN=xxx
TWITTER_ACCESS_SECRET=xxx

# Invitations (if using InvitationModule)
INVITATION_URLS_BASE_URL=http://localhost:3001/invitations
```

## Troubleshooting

### "forRoot() is not supported" error

All modules now require `forRootAsync()`. Replace:

```typescript
SomeModule.forRoot();
```

with:

```typescript
SomeModule.forRootAsync({ ... })
```

### Missing dependency errors

Modules no longer auto-import their dependencies. Check that you're providing required modules via the `imports` array in your `forRootAsync` options.

### Type errors with configuration

Import the types from the library:

```typescript
import type {
    CoreModuleOptions,
    AuthzModuleOptions,
    // etc.
} from "@darraghor/nest-backend-libs";
```

## Summary of Exported Types

```typescript
// Module options interfaces
import type {
    CoreModuleOptions,
    CoreModuleAsyncOptions,
    LoggerModuleOptions,
    LoggerModuleAsyncOptions,
    AuthzModuleOptions,
    AuthzModuleAsyncOptions,
    AuthzClientModuleOptions,
    AuthzClientModuleAsyncOptions,
    StripeModuleOptions,
    StripeModuleAsyncOptions,
    SmtpEmailModuleOptions,
    SmtpEmailModuleAsyncOptions,
    TwitterModuleOptions,
    TwitterModuleAsyncOptions,
    InvitationModuleOptions,
    InvitationModuleAsyncOptions,
} from "@darraghor/nest-backend-libs";

// Injection tokens (for advanced use cases)
import {
    CORE_MODULE_OPTIONS,
    LOGGER_MODULE_OPTIONS,
    AUTHZ_MODULE_OPTIONS,
    AUTHZ_CLIENT_MODULE_OPTIONS,
    STRIPE_MODULE_OPTIONS,
    SMTP_EMAIL_MODULE_OPTIONS,
    TWITTER_MODULE_OPTIONS,
    INVITATION_MODULE_OPTIONS,
} from "@darraghor/nest-backend-libs";
```
