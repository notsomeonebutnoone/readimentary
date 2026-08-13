export const ACTIVE_SUBSCRIPTION_STATUSES = ['active', 'trialing'];
// Entitlement policy: access is active only when Stripe reports active or trialing.
// Past_due, unpaid, canceled, incomplete, and incomplete_expired do not grant access.
export function hasActiveEntitlement(status, currentPeriodEnd = null) {
  if (!ACTIVE_SUBSCRIPTION_STATUSES.includes(status)) return false;
  return !currentPeriodEnd || new Date(currentPeriodEnd).getTime() > Date.now();
}
export async function getOrCreateCustomer({ sql, stripe, userId, email }) {
  const rows = await sql`select stripe_customer_id from billing_customers where clerk_user_id = ${userId}`;
  if (rows[0]?.stripe_customer_id) return rows[0].stripe_customer_id;
  const customer = await stripe.customers.create({ email, metadata: { clerk_user_id: userId } });
  await sql`insert into billing_customers (clerk_user_id, stripe_customer_id) values (${userId}, ${customer.id}) on conflict (clerk_user_id) do update set stripe_customer_id = excluded.stripe_customer_id, updated_at = now()`;
  return customer.id;
}
export async function getCustomerForUser({ sql, userId }) { const rows = await sql`select stripe_customer_id from billing_customers where clerk_user_id = ${userId}`; return rows[0]?.stripe_customer_id || null; }
export async function statusForUser({ sql, userId }) {
  const rows = await sql`select plan, billing_interval, status, current_period_end, cancel_at_period_end from subscriptions where clerk_user_id = ${userId} order by updated_at desc limit 1`;
  const sub = rows[0];
  const active = hasActiveEntitlement(sub?.status, sub?.current_period_end);
  return { tier: active ? (sub?.plan || 'paid') : 'free', active, subscription: sub || null };
}
