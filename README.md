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

## Stripe Module Notes

A module for integrating stripe into your nest application.

### Default functionality

Webhook handling into a queue is automatically added to the module
A controller to generate a customer portal session for authenticated users is added to the module

### You must manually add the following to your own module

A controller to create a checkout session for either Authenticated or Unauthenticated users (your choice if you want your front end app to force users to auth or not)

A handler for the webhook queue events. You can see an example `StripeQueuedEventHandler` in Miller but you will probably want to do different actions for your customers.

### Env vars

STRIPE_ACCESS_TOKEN
Why: To create stripe sessions using the api
Where: https://dashboard.stripe.com/apikeys

STRIPE_WEBHOOK_VERIFICATION_KEY
Why: To verify the webhook signature
Where: https://dashboard.stripe.com/apikeys

STRIPE_REDIRECTS_BASE_URL
Why: To securely redirect the user to the correct website after checkout we don't use a full url
in the request object, only a path which is combined with this base url
Where: your frontend configuration

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
