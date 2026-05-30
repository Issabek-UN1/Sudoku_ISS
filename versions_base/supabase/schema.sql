create extension if not exists "uuid-ossp";

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  name text,
  avatar text,
  city text default 'Алматы',
  theme text default 'light' check (theme in ('light', 'dark')),
  created_at timestamptz default now()
);

create table if not exists public.daily_challenges (
  id uuid primary key default uuid_generate_v4(),
  date date not null unique,
  seed text not null,
  difficulty text not null check (difficulty in ('easy', 'medium', 'hard', 'expert')),
  created_at timestamptz default now()
);

create table if not exists public.solutions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  challenge_id uuid references public.daily_challenges(id) on delete set null,
  time integer not null check (time >= 0),
  errors integer not null default 0 check (errors >= 0),
  accuracy numeric not null check (accuracy >= 0 and accuracy <= 100),
  difficulty text default 'easy',
  created_at timestamptz default now()
);

create table if not exists public.leaderboards (
  user_id uuid primary key references public.users(id) on delete cascade,
  city text default 'Алматы',
  total_score integer not null default 0,
  rank integer,
  updated_at timestamptz default now()
);

create table if not exists public.subscriptions (
  user_id uuid primary key references public.users(id) on delete cascade,
  plan text not null default 'free',
  stripe_customer_id text,
  status text not null default 'inactive',
  current_period_end timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.game_sessions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users(id) on delete cascade,
  board jsonb not null,
  solution jsonb not null,
  notes jsonb,
  difficulty text not null,
  elapsed integer default 0,
  mistakes jsonb default '[]'::jsonb,
  completed boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_users_city on public.users(city);
create index if not exists idx_solutions_user_id on public.solutions(user_id);
create index if not exists idx_solutions_challenge_id on public.solutions(challenge_id);
create index if not exists idx_leaderboards_city_rank on public.leaderboards(city, rank);

create or replace view public.leaderboards_view as
select
  l.user_id,
  u.name,
  u.avatar,
  l.city,
  l.total_score,
  rank() over (order by l.total_score desc) as rank
from public.leaderboards l
join public.users u on u.id = l.user_id;

alter table public.users enable row level security;
alter table public.daily_challenges enable row level security;
alter table public.solutions enable row level security;
alter table public.leaderboards enable row level security;
alter table public.subscriptions enable row level security;
alter table public.game_sessions enable row level security;

create policy "Users can read public profiles" on public.users for select using (true);
create policy "Users can update own profile" on public.users for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.users for insert with check (auth.uid() = id);

create policy "Daily challenges are public" on public.daily_challenges for select using (true);

create policy "Users read own solutions" on public.solutions for select using (auth.uid() = user_id);
create policy "Users insert own solutions" on public.solutions for insert with check (auth.uid() = user_id);

create policy "Leaderboards are public" on public.leaderboards for select using (true);
create policy "Users can update own leaderboard" on public.leaderboards for update using (auth.uid() = user_id);
create policy "Users can insert own leaderboard" on public.leaderboards for insert with check (auth.uid() = user_id);

create policy "Users read own subscription" on public.subscriptions for select using (auth.uid() = user_id);

create policy "Users manage own sessions" on public.game_sessions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, name, avatar)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url')
  on conflict (id) do nothing;

  insert into public.leaderboards (user_id, city, total_score)
  values (new.id, 'Алматы', 0)
  on conflict (user_id) do nothing;

  insert into public.subscriptions (user_id, plan, status)
  values (new.id, 'free', 'inactive')
  on conflict (user_id) do nothing;

  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();
