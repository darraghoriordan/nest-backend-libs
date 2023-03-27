// The "barrels" issue means these must all be imported individually, which is a pain.

/* eslint-disable unicorn/prefer-export-from */
import {RunningCommandLineModule} from "./runningCommandLine/RunningCommandLine.module.js";
import {TwitterAccountModule} from "./twitter-client/twitter-account.module.js";
import {SmtpEmailClientModule} from "./smtp-email-client/smtp-email-client.module.js";
import {EUploadMimeType} from "twitter-api-v2";
import {ValidatedConfigurationService} from "./configuration/ValidatedConfigurationService.js";
import {CoreConfigurationService} from "./core-config/CoreConfigurationService.js";
import {PostgresDatabaseModule} from "./database-postgres/PostgresDatabase.module.js";
import {PostgresTypeOrmConfigurationProvider} from "./database-postgres/PostgresTypeOrmConfigurationProvider.js";
import {SqliteDatabaseModule} from "./database-sqlite/SqliteDatabase.module.js";
import {SqliteDatabaseConfigurationService} from "./database-sqlite/SqliteDatabaseConfigurationService.js";
import {SmtpEmailClient} from "./smtp-email-client/email-client.service.js";
import {CoreModule} from "./root-app/core-app.module.js";
import {SwaggerGen} from "./root-app/SwaggerGen.js";
import {TwitterClientService} from "./twitter-client/services/twitter-client.service.js";
import {CoreConfigModule} from "./core-config/CoreConfig.module.js";
import {CliCommandService} from "./runningCommandLine/CliCommandService.js";
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

export type {RequestUser} from "./authorization/models/RequestWithUser.js";
export {SuperPowersModule} from "./super-powers/super-powers.module.js";
export {OrganisationModule} from "./organisation/organisation.module.js";

// org subscriptions
export {OrganisationMembershipsService} from "./organisation-memberships/organisation-memberships.service.js";
export {OrganisationMembershipsModule} from "./organisation-memberships/organisation-memberships.module.js";
export {OrganisationSubscriptionsModule} from "./organisation-subscriptions/organisation-subscriptions.module.js";
export {OrganisationSubscriptionService} from "./organisation-subscriptions/organisation-subscriptions.service.js";
export {OrganisationSubscriptionRecord} from "./organisation-subscriptions/entities/organisation-subscription.entity.js";

// stripe
export {StripeCheckoutController} from "./stripe-client/controllers/stripe-checkout-controller.js";
export {StripeUnauthenticatedCheckoutController} from "./stripe-client/controllers/stripe-unauthenticated-checkout-controller.js";
export {StripeCheckoutSessionRequestDto} from "./stripe-client/models/StripeCheckoutSessionRequestDto.js";
export {StripeCheckoutSessionResponseDto} from "./stripe-client/models/StripeCheckoutSessionResponseDto.js";
export {StripeCheckoutLineItem} from "./stripe-client/models/StripeCheckoutLineItem.js";
export {StripeAccountModule} from "./stripe-client/stripe-account.module.js";
export {StripeQueuedEventHandler} from "./stripe-client/services/queued-payment-event.handler.js";

// authorization module
export {AuthzModule} from "./authorization/authz.module.js";
export {JwtStrategy} from "./authorization/strategies/authzstrategy.js";
export {DefaultAuthGuard} from "./authorization/guards/DefaultAuthGuard.js";
export {RequestWithUser} from "./authorization/models/RequestWithUser.js";
export {ClaimsAuthorisationGuard} from "./authorization/guards/ClaimsAuthorisationGuard.js";
export {MandatoryUserClaims} from "./authorization/guards/MandatoryUserClaims.decorator.js";
export {SuperUserClaims} from "./authorization/models/SuperUserClaims.js";
export {isOwnerOrThrow} from "./authorization/isOwnerOrThrow.js";
export {ApiKeyAuthGuard} from "./authorization/guards/ApiKeyAuthGuard.js";
export {ApiKeyStrategy} from "./authorization/strategies/apikeystrategy.js";

// invitations
export {InvitationModule} from "./invitations/invitation.module.js";
export {InvitationService} from "./invitations/invitation.service.js";
export {Invitation} from "./invitations/entities/invitation.entity.js";
export {CreateInvitationDto} from "./invitations/dto/create-invitation.dto.js";
export {UserInternalModule} from "./user/user-internal.module.js";
export {UserApiKeyService} from "./user-api-key/user-apikey.service.js";
export {UserApiKeyController} from "./user-api-key/user-apikey.controller.js";
export {UserApiKeyModule} from "./user-api-key/user-apikey.module.js";
export {User} from "./user/entities/user.entity.js";
export {UserService} from "./user/user.service.js";
