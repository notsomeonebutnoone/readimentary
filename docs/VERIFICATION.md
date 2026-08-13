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
| Authentication | Signed-out access tests pass. With no Clerk publishable key, the real UI stays signed out and displays an explicit configuration state instead of creating a local user. Server code verifies Clerk tokens and authorized parties. | Code passed, credentialed acceptance blocked |
| Billing HTTP boundary | Requests through the real local HTTP adapter returned `401` for signed-out status, checkout, and portal; `405` for GET on the webhook; and `400 INVALID_SIGNATURE` for an invalid Stripe signature. | Passed for signed-out and defensive paths |
| Checkout validation | Handler tests reject unauthenticated requests, unknown plans, and browser-supplied price IDs, amounts, customer IDs, and email fields. Controlled plan mapping is server-side. | Passed with injected test dependencies |
| Webhook idempotency | Handler tests confirm invalid signatures are rejected and a duplicate event ID is not applied twice. | Passed with an injected transactional database |
| Entitlements | Status tests derive access from subscription records and the documented active/trialing policy rather than browser state. | Passed with an injected database |
| Vercel packaging | Vercel deployment for the current commit completed successfully. Root `api/` functions are included and SPA rewrites exclude `/api`. | Passed |
| Public preview | The generated preview URL is protected by Vercel authentication, so anonymous page/API acceptance requests receive the Vercel protection page. | Externally blocked |
| Production build | `npm run build` exits successfully. | Passed |
| Automated tests | `npm test` passes 18 tests across 5 files. | Passed |
| Progressive parser | `node scripts/verify-progressive-parser.mjs` passes and observes page-one-first extraction with totals increasing through completion. | Passed |
| Lint | `npm run lint` exits successfully with two pre-existing React Hook warnings in `ScrollStack.jsx` and `PDFViewer.jsx`. | Passed with known warnings |
| Package dry run | `npm pack --dry-run --json` exits successfully and enumerates 68 files. | Passed |
| Dependency audit | `npm audit --omit=dev` reports 11 existing production findings: 10 high and 1 critical, primarily Electron/build tooling plus `pdfjs-dist`. No force upgrade was applied because it could break the desktop/PDF runtime and requires separate compatibility work. | Follow-up required |
| Secret/artifact scan | No committed `.env`, private key, PEM, generated database, or known fabricated-auth markers were found. | Passed |

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
