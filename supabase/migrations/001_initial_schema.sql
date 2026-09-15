-- ─────────────────────────────────────────────
-- Antigravity — Database Schema
-- Run this in your Supabase SQL Editor
-- ─────────────────────────────────────────────

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- ── Players ─────────────────────────────────
create table players (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  avatar_color text not null default '#06b6d4',
  created_at timestamptz not null default now()
);

-- ── Tournaments ─────────────────────────────
create type tournament_status as enum (
  'DRAFT',
  'LEAGUE_ACTIVE',
  'LEAGUE_COMPLETE',
  'KNOCKOUT_ACTIVE',
  'COMPLETE'
);

create table tournaments (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  status tournament_status not null default 'DRAFT',
  config jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── Tournament Players (join table) ─────────
create table tournament_players (
  id uuid primary key default uuid_generate_v4(),
  tournament_id uuid not null references tournaments(id) on delete cascade,
  player_id uuid not null references players(id) on delete cascade,
  unique(tournament_id, player_id)
);

-- ── Stages ──────────────────────────────────
create type stage_type as enum ('LEAGUE', 'KNOCKOUT');

create table stages (
  id uuid primary key default uuid_generate_v4(),
  tournament_id uuid not null references tournaments(id) on delete cascade,
  type stage_type not null,
  stage_order int not null default 1,
  created_at timestamptz not null default now()
);

-- ── Teams (ephemeral, per-match) ────────────
create table teams (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz not null default now()
);

-- ── Team Players ────────────────────────────
create table team_players (
  id uuid primary key default uuid_generate_v4(),
  team_id uuid not null references teams(id) on delete cascade,
  player_id uuid not null references players(id) on delete cascade
);

-- ── Matches ─────────────────────────────────
create type match_status as enum ('UPCOMING', 'LIVE', 'COMPLETED');

create table matches (
  id uuid primary key default uuid_generate_v4(),
  stage_id uuid not null references stages(id) on delete cascade,
  round_number int not null,
  team1_id uuid not null references teams(id),
  team2_id uuid not null references teams(id),
  status match_status not null default 'UPCOMING',
  winner_team_id uuid references teams(id),
  white_team_id uuid references teams(id),
  /** Knockout round label, null for league matches */
  knockout_round text,
  created_at timestamptz not null default now()
);

-- ── Match Player Stats ──────────────────────
create type match_result as enum ('WIN', 'LOSS');

create table match_player_stats (
  id uuid primary key default uuid_generate_v4(),
  match_id uuid not null references matches(id) on delete cascade,
  player_id uuid not null references players(id),
  team_id uuid not null references teams(id),
  bucks int not null default 0,
  result match_result not null,
  is_queen_winner boolean not null default false,
  created_at timestamptz not null default now()
);

-- ── Indexes for performance ─────────────────
create index idx_tournament_players_tournament on tournament_players(tournament_id);
create index idx_stages_tournament on stages(tournament_id);
create index idx_matches_stage on matches(stage_id);
create index idx_match_player_stats_match on match_player_stats(match_id);
create index idx_match_player_stats_player on match_player_stats(player_id);
create index idx_team_players_team on team_players(team_id);

-- ── RLS Policies (permissive for now) ───────
-- Enable RLS but allow all operations (no auth yet)
alter table players enable row level security;
alter table tournaments enable row level security;
alter table tournament_players enable row level security;
alter table stages enable row level security;
alter table teams enable row level security;
alter table team_players enable row level security;
alter table matches enable row level security;
alter table match_player_stats enable row level security;

-- Allow all for anon (will tighten with auth later)
create policy "Allow all" on players for all using (true) with check (true);
create policy "Allow all" on tournaments for all using (true) with check (true);
create policy "Allow all" on tournament_players for all using (true) with check (true);
create policy "Allow all" on stages for all using (true) with check (true);
create policy "Allow all" on teams for all using (true) with check (true);
create policy "Allow all" on team_players for all using (true) with check (true);
create policy "Allow all" on matches for all using (true) with check (true);
create policy "Allow all" on match_player_stats for all using (true) with check (true);
