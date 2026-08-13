import { createAuth } from '../_lib/auth.mjs';
import { getSql } from '../_lib/db.mjs';
import { getStripe } from '../_lib/stripe.mjs';
import { appUrl, resolveServerPrice } from '../_lib/config.mjs';
import { getOrCreateCustomer } from '../_lib/billing.mjs';
import { handleError, methodNotAllowed, readJson, sendJson } from '../_lib/http.mjs';
export function createCheckoutHandler({ requireAuth, sql, stripe, env = process.env } = {}) {
  return async function checkout(req, res) {
    if (req.method !== 'POST') return methodNotAllowed(res, 'POST');
    try {
      const authenticate = requireAuth || createAuth({ env });
      const auth = await authenticate(req);
      const database = sql || getSql(env);
      const stripeClient = stripe || getStripe(env);
      const body = await readJson(req);
      if ('priceId' in body || 'amount' in body || 'customerId' in body || 'email' in body) {
        const error = new Error('Billing identifiers and amounts are selected by the server.');
        error.status = 400;
        error.code = 'UNTRUSTED_BILLING_INPUT';
        throw error;
      }
      const { priceId, plan, billingInterval } = resolveServerPrice({ plan: body.plan, billingInterval: body.billingInterval }, env);
      const customer = await getOrCreateCustomer({ sql: database, stripe: stripeClient, userId: auth.userId, email: auth.claims?.email });
      const base = appUrl(env);
      const session = await stripeClient.checkout.sessions.create({ mode: 'subscription', customer, client_reference_id: auth.userId, line_items: [{ price: priceId, quantity: 1 }], success_url: `${base}/?checkout=success`, cancel_url: `${base}/?checkout=cancelled`, metadata: { clerk_user_id: auth.userId, plan, billing_interval: billingInterval }, subscription_data: { metadata: { clerk_user_id: auth.userId, plan, billing_interval: billingInterval } } });
      return sendJson(res, 200, { url: session.url, id: session.id });
    } catch (error) { return handleError(res, error); }
  };
}
export default async function handler(req, res) { return createCheckoutHandler()(req, res); }
