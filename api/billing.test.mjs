import { describe, expect, it, vi } from 'vitest';
import { Readable } from 'node:stream';
import Stripe from 'stripe';
import { createCheckoutHandler } from './billing/checkout.mjs';
import { createPortalHandler } from './billing/portal.mjs';
import { createStatusHandler } from './billing/status.mjs';
import { createStripeWebhookHandler, processStripeEvent } from './webhooks/stripe.mjs';

function req({ method = 'GET', body, headers = {} } = {}) {
  const r = Readable.from(body ? [typeof body === 'string' ? body : JSON.stringify(body)] : []);
  r.method = method; r.headers = headers; return r;
}
function res() {
  return { headers: {}, setHeader(k, v) { this.headers[k] = v; }, end(body) { this.body = body; this.json = JSON.parse(body); } };
}
function authed(userId = 'user_1') { return vi.fn(async () => ({ userId, claims: { email: 'u@example.com' } })); }
function fakeSql({ customer = 'cus_1', subscriptionStatus = 'active' } = {}) {
  const calls = [];
  const sql = async (strings, ...values) => {
    calls.push({ text: strings.join('?'), values });
    const text = strings.join('?');
    if (text.includes('from billing_customers')) return customer ? [{ stripe_customer_id: customer }] : [];
    if (text.includes('from subscriptions')) return subscriptionStatus ? [{ plan: 'individual', billing_interval: 'monthly', status: subscriptionStatus, current_period_end: null }] : [];
    return [];
  };
  sql.calls = calls;
  return sql;
}

describe('billing checkout', () => {
  it('rejects unauthenticated requests', async () => {
    const out = res();
    const error = Object.assign(new Error('no'), { status: 401, code: 'UNAUTHENTICATED' });
    await createCheckoutHandler({ requireAuth: vi.fn(async () => { throw error; }), sql: fakeSql(), stripe: {}, env: {} })(req({ method: 'POST', body: {} }), out);
    expect(out.statusCode).toBe(401);
    expect(out.json.error.code).toBe('UNAUTHENTICATED');
  });

  it('rejects unknown plan values', async () => {
    const out = res();
    await createCheckoutHandler({ requireAuth: authed(), sql: fakeSql(), stripe: {}, env: { STRIPE_PRICE_INDIVIDUAL_MONTHLY: 'price_server' } })(req({ method: 'POST', body: { plan: 'team', billingInterval: 'monthly' } }), out);
    expect(out.statusCode).toBe(400);
    expect(out.json.error.code).toBe('INVALID_PLAN');
  });

  it.each([
    ['priceId', 'price_attacker'],
    ['amount', 1],
    ['customerId', 'cus_attacker'],
    ['email', 'attacker@example.com']
  ])('rejects browser supplied %s', async (field, value) => {
    const out = res();
    await createCheckoutHandler({ requireAuth: authed(), sql: fakeSql(), stripe: {}, env: { STRIPE_PRICE_INDIVIDUAL_MONTHLY: 'price_server' } })(req({ method: 'POST', body: { plan: 'individual', billingInterval: 'monthly', [field]: value } }), out);
    expect(out.statusCode).toBe(400);
    expect(out.json.error.code).toBe('UNTRUSTED_BILLING_INPUT');
  });

  it('uses only server mapped Individual and Pro prices', async () => {
    const create = vi.fn(async (payload) => ({ id: 'cs_1', url: 'https://checkout.test' }));
    const out = res();
    await createCheckoutHandler({ requireAuth: authed('user_7'), sql: fakeSql(), stripe: { checkout: { sessions: { create } } }, env: { APP_URL: 'https://app.test', STRIPE_PRICE_PRO_ANNUAL: 'price_server' } })(req({ method: 'POST', body: { plan: 'pro', billingInterval: 'annual' } }), out);
    expect(out.statusCode).toBe(200);
    expect(create.mock.calls[0][0]).toMatchObject({
      mode: 'subscription',
      client_reference_id: 'user_7',
      line_items: [{ price: 'price_server', quantity: 1 }],
      metadata: { clerk_user_id: 'user_7', plan: 'pro', billing_interval: 'annual' },
      subscription_data: { metadata: { clerk_user_id: 'user_7', plan: 'pro', billing_interval: 'annual' } }
    });
  });
});

describe('billing portal', () => {
  it('rejects a browser supplied customer ID', async () => {
    const out = res();
    await createPortalHandler({ requireAuth: authed(), sql: fakeSql(), stripe: {} })(req({ method: 'POST', body: { customerId: 'cus_attacker' } }), out);
    expect(out.statusCode).toBe(400);
    expect(out.json.error.code).toBe('UNTRUSTED_BILLING_INPUT');
  });

  it('derives the customer from the authenticated user record', async () => {
    const create = vi.fn(async () => ({ url: 'https://billing.test' }));
    const out = res();
    await createPortalHandler({ requireAuth: authed('user_9'), sql: fakeSql({ customer: 'cus_server' }), stripe: { billingPortal: { sessions: { create } } }, env: { APP_URL: 'https://app.test' } })(req({ method: 'POST' }), out);
    expect(out.statusCode).toBe(200);
    expect(create).toHaveBeenCalledWith({ customer: 'cus_server', return_url: 'https://app.test/?billing=portal' });
  });
});

describe('billing status', () => {
  it('returns server authoritative paid/free entitlement from DB status', async () => {
    const paid = res();
    await createStatusHandler({ requireAuth: authed(), sql: fakeSql({ subscriptionStatus: 'trialing' }) })(req({ method: 'GET' }), paid);
    expect(paid.json).toMatchObject({ active: true, tier: 'individual' });
    const free = res();
    await createStatusHandler({ requireAuth: authed(), sql: fakeSql({ subscriptionStatus: 'past_due' }) })(req({ method: 'GET' }), free);
    expect(free.json).toMatchObject({ active: false, tier: 'free' });
  });
});

describe('stripe webhook', () => {
  it('accepts a raw request signed by the real Stripe SDK', async () => {
    const secret = 'whsec_test_boundary';
    const payload = JSON.stringify({ id: 'evt_sdk_1', object: 'event', type: 'radar.early_fraud_warning.created', data: { object: {} } });
    const stripe = new Stripe('sk_test_boundary');
    const signature = stripe.webhooks.generateTestHeaderString({ payload, secret });
    const out = res();
    await createStripeWebhookHandler({ sql: fakeSql(), stripe, env: { STRIPE_WEBHOOK_SECRET: secret } })(req({ method: 'POST', body: payload, headers: { 'stripe-signature': signature } }), out);
    expect(out.statusCode).toBe(200);
    expect(out.json).toMatchObject({ received: true, ignored: true });
  });

  it('rejects invalid signatures', async () => {
    const out = res();
    const stripe = { webhooks: { constructEvent: vi.fn(() => { throw new Error('bad sig'); }) } };
    await createStripeWebhookHandler({ sql: fakeSql(), stripe, env: { STRIPE_WEBHOOK_SECRET: 'whsec' } })(req({ method: 'POST', body: '{}', headers: { 'stripe-signature': 'bad' } }), out);
    expect(out.statusCode).toBe(400);
    expect(out.json.error.code).toBe('INVALID_SIGNATURE');
  });

  it('is idempotent for duplicate event IDs', async () => {
    const tx = vi.fn(async (strings, ...values) => strings.join('?').includes('stripe_events') ? [] : [{ ok: true }]);
    const sql = { begin: vi.fn(async (fn) => fn(tx)) };
    const result = await processStripeEvent({ event: { id: 'evt_1', type: 'customer.subscription.updated', data: { object: { id: 'sub_1', customer: 'cus_1', status: 'active', metadata: { clerk_user_id: 'user_1', plan: 'individual', billing_interval: 'monthly' }, items: { data: [{ price: { id: 'price_1', recurring: { interval: 'month' } } }] } } } }, sql, stripe: {} });
    expect(result).toEqual({ duplicate: true });
    expect(tx).toHaveBeenCalledTimes(1);
  });
});
