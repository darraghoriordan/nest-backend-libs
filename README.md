# nest-backend-libs

Nest backend libraries is a set of NestJS modules that accelerate product builds with the NestJS framework.

This is the code that powers the backend for [Miller Start website](https://usemiller.dev) and some other apps I run.

You can see how this library is used in a NestJS application on GitHub as [use-miller](https://github.com/darraghoriordan/use-miller).

## Modules used in most applications

The library includes the following modules that can be imported into your NestJS application. They are mostly dependant on each other so you should import them all. But they are things that are common to most applications so it makes sense to have them together in this library if you use this stack.

-   Authorization
-   Auth0 for authentication
-   Configuration
-   Postgres + typeorm
-   SQLite + typeorm
-   health checks
-   invitations
-   logging
-   organisations
-   subscriptions
-   payments (Stripe but should work with any)
-   CLI (e.g. for running stable diffusion)

## Modules with no dependencies

-   Open API

## Stripe payments

`StripePaymentsModule` is the opinionated Stripe integration for new applications. It
owns the server-side product catalog, authenticated organisation-owner checkout,
idempotency records, safe redirect construction, customer portal sessions, signature
verification, a durable webhook inbox, retries, replay, and subscription state updates.

Configure it with an async factory. Products are deliberately configured on the server;
clients send a product key, never arbitrary Stripe line items or prices:

```ts
StripePaymentsModule.forRootAsync({
    imports: [ConfigModule],
    inject: [ConfigService],
    useFactory: (config: ConfigService) => ({
        accessToken: config.getOrThrow("STRIPE_ACCESS_TOKEN"),
        webhookVerificationKey: config.getOrThrow(
            "STRIPE_WEBHOOK_VERIFICATION_KEY",
        ),
        redirectsBaseUrl: config.getOrThrow("STRIPE_REDIRECTS_BASE_URL"),
        products: parseStripeProductCatalog(
            config.getOrThrow("STRIPE_PRODUCT_CATALOG_JSON"),
        ),
    }),
});
```

Run `StrengthenStripePayments1775000000000` in the consuming application's migration
set before enabling the module. The migration creates checkout idempotency records,
the webhook inbox, payment ordering state, and the transaction uniqueness constraint.

`StripeAccountModule`, `StripeCheckoutService`, and `StripeQueuedEventHandler` remain
available for existing applications but are deprecated. They accept unsafe legacy
inputs and do not receive fixes made to the v2 flow; migrate to `StripePaymentsModule`.

### Testing

https://stripe.com/docs/webhooks/test

```bash
brew install stripe/stripe-cli/stripe
stripe login
# setup webhook forwarding - change port to your BACKEND port
 stripe listen --forward-to localhost:34522/payments/stripe/webhook-receiver

# now you can test webhooks

# if you like you can trigger a test webhook
 stripe trigger checkout.session.completed
 stripe trigger payment_intent.succeeded
```

## Testing with local nest-back-end-libs

```bash
pnpm add ../../../nest-backend-libs --force
```
