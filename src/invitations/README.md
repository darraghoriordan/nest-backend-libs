## Sending email verification emails

The invitations you send are matched to a user signing up via their email address.

If the customer uses the username/password login flow then the email address must be verified before the invitation can be accepted.

Auth0 can send verification email automatically for you but you must configure a rule on your account manually first

The content for the rule is below.

```js
function (user, context, callback) {
   user.user_metadata = user.user_metadata || {};
   if (user.email_verified || user.user_metadata.verification_email_sent) {
     return callback(null, user, context);
   }

   var ManagementClient = require('auth0@2.9.1').ManagementClient;
   var management = new ManagementClient({
     token: auth0.accessToken,
     domain: auth0.domain
   });

   var params = {
       user_id: user.user_id
   };
   console.log("user object: ", user);

    management.sendEmailVerification(params, function (err) {
       if (err) {
         // Handle error.
         console.log(err);
       }
       console.log("email sent?");

       callback(null, user, context);
    });
 }
```