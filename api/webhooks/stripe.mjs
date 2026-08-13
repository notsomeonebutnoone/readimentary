import { getSql } from '../_lib/db.mjs';
import { getStripe } from '../_lib/stripe.mjs';
import { handleError, methodNotAllowed, readRawBody, sendJson } from '../_lib/http.mjs';

export const config = { api: { bodyParser: false } };

const REQUIRED_EVENTS = new Set([
  'checkout.session.completed',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'invoice.paid',
  'invoice.payment_failed'
]);

function subscriptionFields(subscription) {
  const item = subscription.items?.data?.[0];
  return {
    stripeSubscriptionId: subscription.id,
    stripeCustomerId: typeof subscription.customer === 'string' ? subscription.customer : subscription.customer?.id,
    status: subscription.status,
    priceId: item?.price?.id || '',
    currentPeriodEnd: (subscription.current_period_end || item?.current_period_end) ? new Date((subscription.current_period_end || item.current_period_end) * 1000) : null,
    cancelAtPeriodEnd: Boolean(subscription.cancel_at_period_end),
    clerkUserId: subscription.metadata?.clerk_user_id,
    plan: subscription.metadata?.plan || 'individual',
    billingInterval: subscription.metadata?.billing_interval || (item?.price?.recurring?.interval === 'year' ? 'annual' : 'monthly')
  };
}

async function upsertSubscription(tx, subscription) {
  const s = subscriptionFields(subscription);
  if (!s.clerkUserId || !s.stripeCustomerId || !s.stripeSubscriptionId) return;
  await tx`insert into billing_customers (clerk_user_id, stripe_customer_id) values (${s.clerkUserId}, ${s.stripeCustomerId}) on conflict (clerk_user_id) do update set stripe_customer_id = excluded.stripe_customer_id, updated_at = now()`;
  await tx`insert into subscriptions (clerk_user_id, stripe_customer_id, stripe_subscription_id, status, plan, billing_interval, price_id, current_period_end, cancel_at_period_end) values (${s.clerkUserId}, ${s.stripeCustomerId}, ${s.stripeSubscriptionId}, ${s.status}, ${s.plan}, ${s.billingInterval}, ${s.priceId}, ${s.currentPeriodEnd}, ${s.cancelAtPeriodEnd}) on conflict (stripe_subscription_id) do update set status = excluded.status, plan = excluded.plan, billing_interval = excluded.billing_interval, price_id = excluded.price_id, current_period_end = excluded.current_period_end, cancel_at_period_end = excluded.cancel_at_period_end, updated_at = now()`;
}

function invoiceSubscriptionId(invoice) {
  const value = invoice.subscription || invoice.parent?.subscription_details?.subscription;
  return typeof value === 'string' ? value : value?.id;
}

export async function processStripeEvent({ event, sql, stripe }) {
  if (!REQUIRED_EVENTS.has(event.type)) return { ignored: true };
  return sql.begin(async (tx) => {
    const inserted = await tx`insert into stripe_events (id, type) values (${event.id}, ${event.type}) on conflict (id) do nothing returning id`;
    if (inserted.length === 0) return { duplicate: true };
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      if (session.mode !== 'subscription' || !session.subscription) return { processed: true };
      const subscription = await stripe.subscriptions.retrieve(session.subscription);
      await upsertSubscription(tx, subscription);
      return { processed: true };
    }
    if (event.type === 'invoice.paid' || event.type === 'invoice.payment_failed') {
      const subscriptionId = invoiceSubscriptionId(event.data.object);
      if (!subscriptionId) return { processed: true };
      await upsertSubscription(tx, await stripe.subscriptions.retrieve(subscriptionId));
      return { processed: true };
    }
    await upsertSubscription(tx, event.data.object);
    return { processed: true };
  });
}

export function createStripeWebhookHandler({ sql, stripe, env = process.env } = {}) {
  return async function stripeWebhook(req, res) {
    if (req.method !== 'POST') return methodNotAllowed(res, 'POST');
    try {
      const database = sql || getSql(env);
      const stripeClient = stripe || getStripe(env);
      const signature = req.headers?.['stripe-signature'];
      const rawBody = await readRawBody(req);
      let event;
      try { event = stripeClient.webhooks.constructEvent(rawBody, signature, env.STRIPE_WEBHOOK_SECRET); }
      catch { const error = new Error('Invalid Stripe signature.'); error.status = 400; error.code = 'INVALID_SIGNATURE'; throw error; }
      const result = await processStripeEvent({ event, sql: database, stripe: stripeClient });
      return sendJson(res, 200, { received: true, ...result });
    } catch (error) { return handleError(res, error); }
  };
}
export default async function handler(req, res) { return createStripeWebhookHandler()(req, res); }
