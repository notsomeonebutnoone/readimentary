import { createAuth } from '../_lib/auth.mjs';
import { getSql } from '../_lib/db.mjs';
import { getStripe } from '../_lib/stripe.mjs';
import { appUrl } from '../_lib/config.mjs';
import { getCustomerForUser } from '../_lib/billing.mjs';
import { handleError, methodNotAllowed, sendJson } from '../_lib/http.mjs';
export function createPortalHandler({ requireAuth, sql, stripe, env = process.env } = {}) {
  return async function portal(req, res) {
    if (req.method !== 'POST') return methodNotAllowed(res, 'POST');
    try {
      const { userId } = await (requireAuth || createAuth({ env }))(req);
      const customer = await getCustomerForUser({ sql: sql || getSql(env), userId });
      if (!customer) { const error = new Error('No billing customer exists for this account.'); error.status = 404; error.code = 'CUSTOMER_NOT_FOUND'; throw error; }
      const session = await (stripe || getStripe(env)).billingPortal.sessions.create({ customer, return_url: `${appUrl(env)}/?billing=portal` });
      return sendJson(res, 200, { url: session.url });
    } catch (error) { return handleError(res, error); }
  };
}
export default async function handler(req, res) { return createPortalHandler()(req, res); }
