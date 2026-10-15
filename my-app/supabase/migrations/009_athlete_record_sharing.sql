-- Athlete ↔ viewer record sharing (meals and/or workouts)
-- Apply this migration in the Supabase SQL editor before using the Sharing / Tracking tabs.

create table if not exists public.athlete_record_shares (
  id uuid primary key default gen_random_uuid(),
  athlete_id uuid not null references public.profiles (id) on delete cascade,
  viewer_id uuid not null references public.profiles (id) on delete cascade,
  share_meals boolean not null default false,
  share_workouts boolean not null default false,
  status text not null default 'pending'
    check (status in ('pending', 'accepted', 'revoked')),
  invite_source text not null default 'invite'
    check (invite_source in ('invite', 'link')),
  share_link_id uuid null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint athlete_record_shares_athlete_viewer_uniq unique (athlete_id, viewer_id),
  constraint athlete_record_shares_not_self check (athlete_id <> viewer_id),
  constraint athlete_record_shares_scope check (share_meals or share_workouts)
);

create table if not exists public.athlete_share_links (
  id uuid primary key default gen_random_uuid(),
  athlete_id uuid not null references public.profiles (id) on delete cascade,
  token text not null unique,
  share_meals boolean not null default false,
  share_workouts boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  expires_at timestamptz null,
  constraint athlete_share_links_scope check (share_meals or share_workouts)
);

alter table public.athlete_record_shares
  drop constraint if exists athlete_record_shares_share_link_id_fkey;

alter table public.athlete_record_shares
  add constraint athlete_record_shares_share_link_id_fkey
  foreign key (share_link_id) references public.athlete_share_links (id) on delete set null;

create index if not exists athlete_record_shares_athlete_idx
  on public.athlete_record_shares (athlete_id, status);

create index if not exists athlete_record_shares_viewer_idx
  on public.athlete_record_shares (viewer_id, status);

create index if not exists athlete_share_links_athlete_idx
  on public.athlete_share_links (athlete_id, is_active);

create index if not exists athlete_share_links_token_idx
  on public.athlete_share_links (token);

alter table public.athlete_record_shares enable row level security;
alter table public.athlete_share_links enable row level security;

-- Shares: athlete manages grants; viewer can read own rows and accept/decline
drop policy if exists "Athletes manage their shares" on public.athlete_record_shares;
create policy "Athletes manage their shares"
  on public.athlete_record_shares
  for all
  using (auth.uid() = athlete_id)
  with check (auth.uid() = athlete_id);

drop policy if exists "Viewers read their shares" on public.athlete_record_shares;
create policy "Viewers read their shares"
  on public.athlete_record_shares
  for select
  using (auth.uid() = viewer_id);

drop policy if exists "Viewers update their share status" on public.athlete_record_shares;
create policy "Viewers update their share status"
  on public.athlete_record_shares
  for update
  using (auth.uid() = viewer_id)
  with check (auth.uid() = viewer_id);

drop policy if exists "Viewers insert accepted link shares" on public.athlete_record_shares;
create policy "Viewers insert accepted link shares"
  on public.athlete_record_shares
  for insert
  with check (
    auth.uid() = viewer_id
    and invite_source = 'link'
    and status = 'accepted'
  );

-- Links: athlete owns; any authed user can read an active link by token to redeem
drop policy if exists "Athletes manage share links" on public.athlete_share_links;
create policy "Athletes manage share links"
  on public.athlete_share_links
  for all
  using (auth.uid() = athlete_id)
  with check (auth.uid() = athlete_id);

drop policy if exists "Authed users read active share links" on public.athlete_share_links;
create policy "Authed users read active share links"
  on public.athlete_share_links
  for select
  using (
    auth.uid() is not null
    and is_active = true
    and (expires_at is null or expires_at > now())
  );

-- Allow accepted viewers to read shared workouts (OR with existing owner policies)
drop policy if exists "Viewers read shared workouts" on public.training_logs;
create policy "Viewers read shared workouts"
  on public.training_logs
  for select
  using (
    exists (
      select 1
      from public.athlete_record_shares s
      where s.athlete_id = training_logs.user_id
        and s.viewer_id = auth.uid()
        and s.status = 'accepted'
        and s.share_workouts = true
    )
  );

drop policy if exists "Viewers read shared meals" on public.meal_records;
create policy "Viewers read shared meals"
  on public.meal_records
  for select
  using (
    exists (
      select 1
      from public.athlete_record_shares s
      where s.athlete_id = meal_records.user_id
        and s.viewer_id = auth.uid()
        and s.status = 'accepted'
        and s.share_meals = true
    )
  );
