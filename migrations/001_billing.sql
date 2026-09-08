create table if not exists billing_customers (
  id bigserial primary key,
  clerk_user_id text not null unique,
  stripe_customer_id text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists subscriptions (
  id bigserial primary key,
  clerk_user_id text not null,
  stripe_customer_id text not null references billing_customers(stripe_customer_id) on update cascade,
  stripe_subscription_id text not null unique,
  status text not null,
  plan text not null check (plan in ('individual', 'pro')),
  billing_interval text not null check (billing_interval in ('monthly', 'annual')),
  price_id text not null,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists subscriptions_clerk_user_id_idx on subscriptions(clerk_user_id);
create index if not exists subscriptions_customer_status_idx on subscriptions(stripe_customer_id, status);
create table if not exists stripe_events (
  id text primary key,
  type text not null,
  processed_at timestamptz not null default now()
);
