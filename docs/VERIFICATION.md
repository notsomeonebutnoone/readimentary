# Verification record

Verified on 2026-08-13 for branch `feat/production-auth-billing-product`.

## Acceptance evidence

| Requirement area | Check and observed result | Status |
| --- | --- | --- |
| Landing order and anchors | Built landing DOM and browser inspection show Signals, Modes, Pricing, Why, Features, About, then Footer. Legal and support links use real routes rather than `#`. | Passed |
| Responsive layout | Real browser captures at 375, 768, and 1440 px reported zero horizontal overflow. Pricing buttons remained inside their cards. The tablet pricing overflow found during verification was fixed by stacking cards until the large breakpoint. | Passed |
| Pricing | Automated rendering tests assert Individual `$15` / `$144`, Pro `$29` / `$278.40`, and Team `$79` / `$758.40`. Team checkout is disabled and labeled coming soon. | Passed |
| Feature, About, and legal copy | Browser inspection confirmed concise functionality-based copy and legal placeholder routes that state final legal review is required. | Passed, legal approval pending |
| Chapter detection | Parser and component tests confirm no synthetic “Start of Document”, a distinct no-headings message with “Read full document”, and normal rendering for real chapters. | Passed |
| Parsing state | Component inspection and the progressive-parser script confirm existing SVG characters, CSS-only reduced-motion-aware animation, and real progressive extraction values. | Passed |
| Authentication | Signed-out access tests pass. With no Clerk publishable key, the real UI stays signed out and displays an explicit configuration state instead of creating a local user. The modal moves focus inside, closes with Escape, and restores focus to “Get Started”. Server code verifies Clerk tokens and authorized parties. | Code passed, credentialed acceptance blocked |
| Billing HTTP boundary | Requests through the real local HTTP adapter returned `401` for missing or malformed authentication on status and checkout; `405` for wrong methods; `400 INVALID_SIGNATURE` for missing or invalid Stripe signatures; `204` for the configured CORS origin; `403` for an untrusted origin; and `404` for an unknown API route. | Passed for signed-out and defensive paths |
| Checkout validation | Handler tests reject unauthenticated requests, unknown plans, and browser-supplied price IDs, amounts, customer IDs, and email fields. Controlled plan mapping is server-side. | Passed with injected test dependencies |
| Webhook idempotency | Handler tests confirm invalid signatures are rejected and a duplicate event ID is not applied twice. | Passed with an injected transactional database |
| Entitlements | Status tests derive access from subscription records and the documented active/trialing policy rather than browser state. | Passed with an injected database |
| Vercel packaging | Vercel deployment for the current commit completed successfully. Root `api/` functions are included and SPA rewrites exclude `/api`. | Passed |
| Public preview | The generated preview URL is protected by Vercel authentication, so anonymous page/API acceptance requests receive the Vercel protection page. | Externally blocked |
| Production build | `npm run build` exits successfully. | Passed |
| Automated tests | `npm test` passes 25 tests across 6 files. | Passed |
| Progressive parser | `node scripts/verify-progressive-parser.mjs` passes and observes page-one-first extraction with totals increasing through completion. | Passed |
| Lint | `npm run lint` exits successfully with two pre-existing React Hook warnings in `ScrollStack.jsx` and `PDFViewer.jsx`. | Passed with known warnings |
| Package dry run | `npm pack --dry-run --json` exits successfully and enumerates 68 files. | Passed |
| Dependency audit | `npm audit --omit=dev` reports 11 existing production findings: 10 high and 1 critical, primarily Electron/build tooling plus `pdfjs-dist`. No force upgrade was applied because it could break the desktop/PDF runtime and requires separate compatibility work. | Follow-up required |
| Secret/artifact scan | No committed `.env`, private key, PEM, generated database, or known fabricated-auth markers were found. | Passed |

## Authentication requirement traceability

| Requirement | Concrete observation |
| --- | --- |
| Clerk provider and combined entry | The production bundle contains the conditional `ClerkProvider` and a single “Get Started” entry rendering Clerk `SignIn` with transferable registration. |
| Google, Apple, and email | These are controlled by the Clerk instance. The code uses Clerk’s hosted component, but provider availability and callbacks cannot be observed without dashboard configuration. |
| Recovery, account menu, sign-out | Clerk components and `UserButton` are wired. A live session is required to observe recovery and account behavior. |
| No fabricated users | Source and secret scans found no `local-preview@readimentary.app`, `isLocal`, generated paid user, or browser-authoritative paid flag. The unconfigured UI remains signed out. |
| Protected access | Access-control tests reject signed-out reader entry, and clicking the public entry opens authentication rather than the reader. |
| Server token verification | Missing and malformed bearer tokens returned `401` through the real HTTP adapter. Valid-token acceptance requires a Clerk instance and secret. |
| Authorized parties/origins | The server passes configured authorized parties to Clerk. Local CORS returned `204` only for `APP_URL` and `403` for an attacker origin. |
| Intended destination | Session storage persistence is implemented and covered by access-control tests. A live sign-in redirect remains blocked. |
| Loading and error states | The public interface visibly presents the unconfigured state and never marks the user authenticated. Clerk loading/error behavior requires its runtime. |
| Keyboard and focus | The auth modal test confirms an accessible dialog name, focus moves to its Close control, Tab and Shift+Tab remain contained, Escape closes it, and focus returns to “Get Started”. The real browser interface also opened from “Get Started” and closed with Escape. Clerk’s internal control traversal remains dependent on its configured component runtime. |

## Billing requirement traceability

| Requirement | Concrete observation |
| --- | --- |
| Authenticated Checkout | Missing and malformed bearer tokens return `401` at the public HTTP boundary. |
| Controlled plans and intervals | Handler tests accept only Individual/Pro monthly/annual mappings and reject Team/unknown values. |
| Untrusted browser billing fields | Handler tests reject supplied price ID, amount, customer ID, and email fields. |
| Subscription mode and identity metadata | Checkout payload tests observe `mode: subscription`, the server price, and Clerk user ID as `client_reference_id`/metadata. |
| Customer reuse and safe redirects | Handler inspection/tests use the database customer record and server `APP_URL`; no browser customer ID or redirect URL is accepted. |
| Success does not grant access | Billing status reads subscription records only. No redirect query or client flag changes entitlement. |
| Webhook raw body and signature | The Vercel webhook disables body parsing. Real HTTP requests with missing/invalid signatures return `400 INVALID_SIGNATURE`; a raw request signed by the real Stripe SDK returns `200` through the local HTTP adapter; and the same boundary is covered by an automated integration test. |
| Webhook idempotency and events | Transactional handler tests observe duplicate event short-circuiting. Event handlers cover checkout, subscription created/updated/deleted, invoice paid, and invoice failed. |
| Entitlement policy | Tests observe `active`/`trialing` as entitled and `past_due` as free; cancellation and period fields come from server records. |
| Customer Portal | Signed-out public requests return `401`; supplied browser customer IDs are explicitly rejected; and the handler derives the Stripe customer from the authenticated user’s database record. Live portal creation is credential-blocked. |
| Billing UI | Pricing and account UI render status/loading/error paths and expose Manage billing only when server status permits. Live subscription transitions are credential-blocked. |
| Postgres persistence | Migration constraints and transactional SQL are included. Durable behavior cannot be observed until a managed database is provisioned and migrated. |
| Vercel routing and methods | The deployment succeeds, `/api` is excluded from SPA rewriting, wrong methods return `405`, and unknown API routes return JSON `404`. |

## Credential-blocked acceptance paths

The following cannot be truthfully marked production-tested until external projects and secrets are supplied:

- Clerk email registration, verification, recovery, account menu, and sign-out
- Google and Apple identity-provider redirects and callbacks
- Authenticated Clerk token verification against the deployed functions
- Stripe test Checkout, subscription lifecycle, Customer Portal, and signed webhook delivery
- Managed Postgres migration and durable webhook transaction behavior
- Authenticated PDF upload and no-chapters browser flow
- Anonymous access to the Vercel preview while deployment protection is enabled

Use `docs/AUTH_AND_BILLING_SETUP.md` to provision these services and execute the remaining test-mode launch checklist. Never use a live Stripe card for verification.
