-- Schema for the Midnight Assassin tour backend (all optional — the app
-- works offline without Supabase).
--
-- Apply in the Supabase dashboard: SQL Editor → New query → paste → Run.
-- Free tier is plenty: two tiny insert-mostly tables.

-- Devices check in when they physically reach a stop (anonymous analytics).
create table if not exists public.visits (
  id bigint generated always as identity primary key,
  device_id text not null,
  stop_id text not null,
  visited_at timestamptz not null default now()
);

-- Free-text feedback / corrections / "ghost sighting" reports.
create table if not exists public.feedback (
  id bigint generated always as identity primary key,
  device_id text not null,
  stop_id text,                -- null = general feedback
  message text not null check (char_length(message) <= 2000),
  created_at timestamptz not null default now()
);

-- Row Level Security: anonymous devices may INSERT but never read, update,
-- or delete. You read the data in the dashboard or with the service key.
alter table public.visits enable row level security;
alter table public.feedback enable row level security;

create policy "anyone can log a visit"
  on public.visits for insert
  to anon
  with check (true);

create policy "anyone can send feedback"
  on public.feedback for insert
  to anon
  with check (true);

-- Handy view: how far do people actually get?
create or replace view public.stop_funnel as
  select stop_id, count(distinct device_id) as devices, count(*) as visits
  from public.visits
  group by stop_id
  order by devices desc;
