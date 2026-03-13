-- Enable UUID extension
create extension if not exists "pgcrypto";

-- =====================
-- AGENTS TABLE
-- =====================
create table public.agents (
  id           uuid primary key default gen_random_uuid(),
  full_name    text not null,
  email        text,
  phone        text,
  state        text not null,
  state_full   text not null,
  created_at   timestamptz default now()
);

create index idx_agents_state on public.agents(state);
create index idx_agents_email on public.agents(email);

alter table public.agents enable row level security;
create policy "No direct client access to agents"
  on public.agents for select
  using (false);

-- =====================
-- PURCHASES TABLE
-- =====================
create table public.purchases (
  id                        uuid primary key default gen_random_uuid(),
  user_id                   uuid references auth.users(id) on delete set null,
  guest_email               text,
  purchase_type             text not null check (purchase_type in ('state', 'full_database', 'subscription')),
  state_code                text,
  lemon_squeezy_order_id    text unique,
  lemon_squeezy_customer_id text,
  amount_paid               integer not null,
  status                    text not null default 'pending' check (status in ('pending', 'completed', 'failed', 'refunded')),
  download_token            uuid default gen_random_uuid(),
  token_used                boolean default false,
  expires_at                timestamptz,
  created_at                timestamptz default now()
);

alter table public.purchases enable row level security;

create policy "Users can view own purchases"
  on public.purchases for select
  using (auth.uid() = user_id);

-- =====================
-- SUBSCRIPTIONS TABLE
-- =====================
create table public.subscriptions (
  id                              uuid primary key default gen_random_uuid(),
  user_id                         uuid references auth.users(id) on delete cascade not null unique,
  lemon_squeezy_subscription_id   text unique not null,
  lemon_squeezy_customer_id       text,
  status                          text not null check (status in ('active', 'paused', 'cancelled', 'expired', 'on_trial')),
  current_period_end              timestamptz,
  created_at                      timestamptz default now(),
  updated_at                      timestamptz default now()
);

alter table public.subscriptions enable row level security;

create policy "Users can view own subscription"
  on public.subscriptions for select
  using (auth.uid() = user_id);

-- =====================
-- DOWNLOAD LOGS TABLE
-- =====================
create table public.download_logs (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references auth.users(id) on delete set null,
  guest_email   text,
  download_type text not null,
  state_code    text,
  ip_address    text,
  user_agent    text,
  created_at    timestamptz default now()
);

alter table public.download_logs enable row level security;

create policy "Users can view own download logs"
  on public.download_logs for select
  using (auth.uid() = user_id);

-- =====================
-- HELPER FUNCTION: check active subscription
-- =====================
create or replace function public.has_active_subscription(p_user_id uuid)
returns boolean as $$
  select exists (
    select 1 from public.subscriptions
    where user_id = p_user_id
      and status = 'active'
      and (current_period_end is null or current_period_end > now())
  );
$$ language sql security definer;
