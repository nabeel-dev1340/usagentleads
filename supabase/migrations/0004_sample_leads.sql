-- Captured free-sample email leads. Previously the free-sample endpoint sent a
-- CSV and discarded the email; this table persists them so a nurture drip can
-- follow up. Writes happen via the service role (RLS-bypassing); no client access.
create table if not exists usagentleads.sample_leads (
  id              uuid primary key default gen_random_uuid(),
  email           text not null unique,
  source          text,                          -- capture point, e.g. 'home_hero', 'state_florida', 'exit_intent'
  drip_stage      integer not null default 0,    -- follow-ups sent so far: 0=sample only, 1=day2, 2=day4, 3=day6
  status          text not null default 'new'
                    check (status in ('new', 'active', 'converted', 'unsubscribed')),
  converted       boolean not null default false,
  last_emailed_at timestamptz,
  created_at      timestamptz not null default now()
);

-- Cron drip selects rows by how far they are through the sequence, oldest first.
create index if not exists idx_sample_leads_drip on usagentleads.sample_leads (drip_stage, created_at)
  where status in ('new', 'active');

alter table usagentleads.sample_leads enable row level security;

grant select, insert, update, delete on usagentleads.sample_leads to service_role;
