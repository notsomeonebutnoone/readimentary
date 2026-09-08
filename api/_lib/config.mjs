const trimSlash = (value) => value?.replace(/\/$/, '');
export function appUrl(env = process.env) { return trimSlash(env.APP_URL || (env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${env.VERCEL_PROJECT_PRODUCTION_URL}` : '') || 'http://localhost:5173'); }
export function authorizedParties(env = process.env) { return [...new Set([appUrl(env), ...(env.CLERK_AUTHORIZED_PARTIES?.split(',').map((v) => v.trim()).filter(Boolean) || [])])]; }
export const BILLING_PLANS = Object.freeze({
  individual: Object.freeze({ monthly: { priceEnv: 'STRIPE_PRICE_INDIVIDUAL_MONTHLY' }, annual: { priceEnv: 'STRIPE_PRICE_INDIVIDUAL_ANNUAL' } }),
  pro: Object.freeze({ monthly: { priceEnv: 'STRIPE_PRICE_PRO_MONTHLY' }, annual: { priceEnv: 'STRIPE_PRICE_PRO_ANNUAL' } })
});
export function resolveServerPrice({ plan, billingInterval }, env = process.env) {
  const entry = BILLING_PLANS[plan]?.[billingInterval];
  if (!entry) { const error = new Error('Choose a supported Individual or Pro monthly or annual plan. Team billing is not enabled.'); error.status = 400; error.code = 'INVALID_PLAN'; throw error; }
  const priceId = env[entry.priceEnv];
  if (!priceId) { const error = new Error('Billing price is not configured.'); error.status = 503; error.code = 'BILLING_NOT_CONFIGURED'; throw error; }
  return { priceId, plan, billingInterval };
}
