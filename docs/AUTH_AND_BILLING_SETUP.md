# Authentication, Billing, and Production Setup

Readimentary keeps PDF bytes and reading state in the browser. Clerk supplies account sessions. Stripe supplies hosted recurring checkout and the customer portal. A managed Postgres database is the server-authoritative source of subscription entitlement.

No production credential belongs in source control. Only `VITE_CLERK_PUBLISHABLE_KEY`, `VITE_SUPPORT_EMAIL`, and an optional public `VITE_API_URL` may be exposed to the browser.

## 1. Local setup

1. Use a current Node.js LTS release and npm.
2. Copy `.env.example` to `.env`.
3. Install packages with `npm install`.
4. Provision a development Postgres database and set `DATABASE_URL`.
5. Run `npm run db:migrate`.
6. Start the local Vercel-compatible API adapter with `npm run dev:api`.
7. Start Vite with `npm run dev`.

Use Stripe test mode and a Clerk development instance locally. Do not place real keys in `.env.example` or commit `.env`.

## 2. Clerk project creation

1. In Clerk, create a new application for Readimentary.
2. Copy the publishable key to `VITE_CLERK_PUBLISHABLE_KEY`.
3. Copy the secret key to `CLERK_SECRET_KEY`.
4. In **User & authentication**, enable email address sign-in and sign-up.
5. Require email verification. Enable an email code or a verified password flow and account recovery.
6. Add `http://localhost:5173` to development allowed origins and redirect URLs.
7. Add the exact preview and production origins before deploying those environments.
8. Set `CLERK_AUTHORIZED_PARTIES` to a comma-separated list of the exact application origins that may present session tokens, for example `http://localhost:5173,https://preview.example.com,https://readimentary.example.com`.

The frontend uses Clerk's combined sign-in component. Clerk does not display a social provider until it is enabled in the Clerk dashboard.

## 3. Google login

1. In Clerk, open **SSO connections** and enable Google.
2. For development, Clerk's shared OAuth credentials may be available depending on the Clerk plan and instance type.
3. For production, create a Google OAuth web client in Google Cloud.
4. Add the redirect URI shown by Clerk exactly to the Google OAuth client's authorized redirect URIs.
5. Add every production and preview origin required by the Google consent configuration.
6. Put the Google client ID and secret in Clerk, not in Vite or this repository.
7. Test sign-in, new registration, account linking, sign-out, and recovery on the intended production domain.

## 4. Apple login

Apple sign-in cannot be considered active until the Apple and Clerk dashboards are configured and tested.

1. Use an Apple Developer account and create or select an App ID.
2. Create a Services ID for the web application and enable **Sign in with Apple**.
3. Add the production domain and the exact return URL supplied by Clerk.
4. Create a Sign in with Apple key and note the Team ID and Key ID.
5. Configure the Services ID, Team ID, Key ID, and private key in Clerk's Apple connection.
6. Verify the production domain if Apple requests it.
7. Repeat the redirect setup for any supported preview domain, or intentionally disable Apple on previews.
8. Test first-time consent, returning sign-in, private relay email, sign-out, and account recovery.

Never put the Apple private key or generated client secret in a `VITE_` variable.

## 5. Stripe products and recurring prices

Work in Stripe **test mode** first.

Create products and recurring prices matching the approved catalog:

| Plan | Monthly | Annual | Environment variable |
|---|---:|---:|---|
| Individual | $15.00 USD | $144.00 USD | `STRIPE_PRICE_INDIVIDUAL_MONTHLY`, `STRIPE_PRICE_INDIVIDUAL_ANNUAL` |
| Pro | $29.00 USD | $278.40 USD | `STRIPE_PRICE_PRO_MONTHLY`, `STRIPE_PRICE_PRO_ANNUAL` |

Use recurring intervals of one month and one year. Copy each `price_...` identifier into the matching server-only variable. Team billing remains disabled until organizations and seat management exist.

Set the test secret key as `STRIPE_SECRET_KEY`. The browser never supplies or selects Stripe Price IDs or amounts.

## 6. Stripe Customer Portal

1. In Stripe test mode, open **Settings → Billing → Customer portal**.
2. Enable payment-method updates, invoice history, cancellation, and switching only between prices the product supports.
3. Choose whether cancellation takes effect immediately or at period end. Keep that choice consistent with product copy.
4. Set the portal business information and support link.
5. Save the test configuration and repeat the setup separately in live mode before launch.

## 7. Local webhook forwarding

Install and authenticate the Stripe CLI, then run:

```bash
stripe listen --forward-to localhost:8787/api/webhooks/stripe
```

Copy the emitted `whsec_...` test secret to `STRIPE_WEBHOOK_SECRET`. Trigger test events or complete a test checkout. The implementation verifies the raw body and signature and records processed event IDs before applying subscription changes.

Required event subscriptions in Stripe are:

- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.paid`
- `invoice.payment_failed`

## 8. Managed Postgres provisioning

Neon is the recommended default, although any Vercel-compatible managed Postgres service that supplies a standard TLS connection string can work.

1. Create separate development and production databases.
2. Prefer a pooled connection URL for serverless functions when the provider offers one.
3. Put the URL in server-only `DATABASE_URL`.
4. Require TLS in production and restrict database access using the provider's controls.
5. Do not use the legacy local SQLite file for deployed entitlement state.

## 9. Database migrations

Run:

```bash
npm run db:migrate
```

The migration creates `billing_customers`, `subscriptions`, and `stripe_events`, including unique constraints and lookup indexes. Apply migrations to preview and production deliberately. Back up production before destructive future migrations. The initial migration is additive.

## 10. Vercel environment variables

Configure variables separately for Development, Preview, and Production in the Vercel project.

Frontend-safe:

- `VITE_CLERK_PUBLISHABLE_KEY`
- `VITE_SUPPORT_EMAIL`
- `VITE_API_URL` only when API functions are intentionally hosted on another public origin. Omit it for same-origin Vercel Functions.

Server-only:

- `APP_URL`
- `CLERK_SECRET_KEY`
- `CLERK_AUTHORIZED_PARTIES`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_INDIVIDUAL_MONTHLY`
- `STRIPE_PRICE_INDIVIDUAL_ANNUAL`
- `STRIPE_PRICE_PRO_MONTHLY`
- `STRIPE_PRICE_PRO_ANNUAL`
- `DATABASE_URL`

Redeploy after changing a Vite variable because it is embedded at build time. Never rename a secret with a `VITE_` prefix.

## 11. Preview and production URLs

For each environment:

1. Set `APP_URL` to the canonical exact origin with no trailing path.
2. Add that origin to Clerk's allowed origins and to `CLERK_AUTHORIZED_PARTIES`.
3. Add the required redirect URLs in Clerk and social-provider dashboards.
4. Create a Stripe webhook endpoint at `https://<origin>/api/webhooks/stripe` and use that endpoint's own signing secret.
5. Do not reuse a production webhook signing secret in preview.

Ephemeral Vercel preview URLs are awkward for Apple and Google allowlists. Prefer a stable preview domain or disable those providers on unapproved previews.

## 12. Test card and test-mode workflow

Use Stripe test mode only. A standard successful test card is:

- Number: `4242 4242 4242 4242`
- Any future expiry
- Any CVC
- Any postal code

Test successful checkout, 3DS where applicable, failed invoice, cancellation at period end, immediate cancellation, plan change, duplicate webhook delivery, portal access, and signed-out endpoint access. A Checkout success URL is not proof of entitlement. Access changes only after a verified webhook updates Postgres.

## 13. Production launch checklist

- [ ] Final legal review completed for Privacy Policy and Terms of Service.
- [ ] Clerk production instance and domain configured.
- [ ] Email verification and recovery tested.
- [ ] Google production OAuth tested.
- [ ] Apple production configuration tested, or Apple intentionally disabled.
- [ ] Stripe live products and recurring prices match approved amounts.
- [ ] Customer Portal live configuration reviewed.
- [ ] Production webhook endpoint receives and verifies all required events.
- [ ] Production Postgres migration applied and backed up.
- [ ] Vercel Production variables set with live values and no secrets exposed to Vite.
- [ ] Test account can sign in, subscribe, refresh entitlement, open portal, cancel, and lose entitlement under the documented policy.
- [ ] Mobile, tablet, desktop, reduced-motion, keyboard, and browser-console checks pass.
- [ ] Monitoring and support ownership are assigned.

## 14. Key rotation and rollback

- Rotate Clerk, Stripe, database, and webhook credentials in their provider dashboards. Update Vercel immediately and redeploy.
- Stripe webhook secrets are endpoint-specific. During a planned rotation, allow both endpoints to overlap briefly rather than accepting unsigned payloads.
- Revoke leaked credentials. Never merely remove them from Git history and continue using them.
- Roll back application code through a known-good Vercel deployment. Do not roll back subscription tables blindly because newer webhook state may already be authoritative.
- Before a database rollback, snapshot the database and compare Stripe subscription state. Prefer a forward fix for additive schema changes.
- If billing must be paused, disable checkout in the UI or remove server Price ID variables. Keep status and webhook processing online so existing subscriptions remain reconcilable.

## Entitlement policy

The server considers only active or trialing Stripe subscriptions entitled. Inactive, incomplete, incomplete-expired, unpaid, paused, or canceled subscriptions are not entitled. A subscription set to cancel at period end remains entitled only while Stripe still reports an active or trialing status and the current period has not ended. The database record written from verified Stripe events is authoritative.
