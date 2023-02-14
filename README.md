# nest-backend-libs

A collection of nest modules for building backends faster

## Stripe Module

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
