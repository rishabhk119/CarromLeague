// ─────────────────────────────────────────────
// Antigravity — Supabase Cloud Integration
// Dual source: Environment variables or Client Config
// ─────────────────────────────────────────────

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Tournament, Match, MatchPlayerStats, Player } from './engine/types';

const STORAGE_URL_KEY = 'antigravity_supabase_url';
const STORAGE_KEY_KEY = 'antigravity_supabase_anon_key';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  source: 'env' | 'custom' | 'none';
  isConfigured: boolean;
}

let cachedClient: SupabaseClient | null = null;
let lastClientKey = '';

export function getSupabaseConfig(): SupabaseConfig {
  const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  if (envUrl && envKey) {
    return {
      url: envUrl,
      anonKey: envKey,
      source: 'env',
      isConfigured: true,
    };
  }

  if (typeof window !== 'undefined') {
    const customUrl = localStorage.getItem(STORAGE_URL_KEY) || '';
    const customKey = localStorage.getItem(STORAGE_KEY_KEY) || '';
    if (customUrl && customKey) {
      return {
        url: customUrl,
        anonKey: customKey,
        source: 'custom',
        isConfigured: true,
      };
    }
  }

  return {
    url: '',
    anonKey: '',
    source: 'none',
    isConfigured: false,
  };
}

export function saveSupabaseConfig(url: string, anonKey: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_URL_KEY, url.trim());
  localStorage.setItem(STORAGE_KEY_KEY, anonKey.trim());
  cachedClient = null;
  lastClientKey = '';
}

export function clearSupabaseConfig(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_URL_KEY);
  localStorage.removeItem(STORAGE_KEY_KEY);
  cachedClient = null;
  lastClientKey = '';
}

export function getSupabaseClient(): SupabaseClient | null {
  const config = getSupabaseConfig();
  if (!config.isConfigured) return null;

  const key = `${config.url}_${config.anonKey}`;
  if (cachedClient && lastClientKey === key) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(config.url, config.anonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
    lastClientKey = key;
    return cachedClient;
  } catch (err) {
    console.error('Failed to init Supabase client:', err);
    return null;
  }
}

/** Test if connection works and tables exist */
export async function testSupabaseConnection(): Promise<{ ok: boolean; message: string }> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { ok: false, message: 'Supabase credentials not configured' };
  }

  try {
    const { error } = await supabase.from('tournaments').select('id').limit(1);
    if (error) {
      return { ok: false, message: `Database error: ${error.message}` };
    }
    return { ok: true, message: 'Successfully connected to Supabase database!' };
  } catch (err: any) {
    return { ok: false, message: err?.message || 'Network error connecting to Supabase' };
  }
}

/** Sync a tournament and its players + matches to Supabase */
export async function syncTournamentToCloud(
  tournament: Tournament,
  matches: Match[]
): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  try {
    // 1. Upsert tournament
    const { error: tErr } = await supabase.from('tournaments').upsert({
      id: tournament.id,
      name: tournament.name,
      status: tournament.status,
      config: tournament.config,
      created_at: tournament.createdAt,
      updated_at: new Date().toISOString(),
    });
    if (tErr) console.warn('Supabase tournament sync warn:', tErr.message);

    // 2. Upsert players
    if (tournament.players.length > 0) {
      const playerRows = tournament.players.map((p) => ({
        id: p.id,
        name: p.name,
        avatar_color: p.avatarColor,
      }));
      await supabase.from('players').upsert(playerRows);

      // Join table
      const tpRows = tournament.players.map((p) => ({
        tournament_id: tournament.id,
        player_id: p.id,
      }));
      await supabase.from('tournament_players').upsert(tpRows, {
        onConflict: 'tournament_id,player_id',
      });
    }

    // 3. Upsert teams and matches
    for (const m of matches) {
      // Upsert teams
      await supabase.from('teams').upsert([{ id: m.team1.id }, { id: m.team2.id }]);

      // Team players
      const teamPlayerRows = [
        ...m.team1.playerIds.map((pid) => ({ team_id: m.team1.id, player_id: pid })),
        ...m.team2.playerIds.map((pid) => ({ team_id: m.team2.id, player_id: pid })),
      ];
      if (teamPlayerRows.length > 0) {
        await supabase.from('team_players').upsert(teamPlayerRows);
      }

      // Upsert match
      await supabase.from('matches').upsert({
        id: m.id,
        stage_id: m.stageId,
        round_number: m.roundNumber,
        team1_id: m.team1.id,
        team2_id: m.team2.id,
        status: m.status,
        winner_team_id: m.winnerTeamId || null,
        white_team_id: m.whiteTeamId || null,
      });
    }

    return true;
  } catch (err) {
    console.error('Error syncing tournament to cloud:', err);
    return false;
  }
}

/** Sync match result and player stats to Supabase */
export async function syncMatchResultToCloud(
  tournamentId: string,
  match: Match,
  stats: MatchPlayerStats[]
): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  try {
    // 1. Update match row
    await supabase
      .from('matches')
      .update({
        status: match.status,
        winner_team_id: match.winnerTeamId || null,
      })
      .eq('id', match.id);

    // 2. Delete and re-insert match_player_stats for this match
    await supabase.from('match_player_stats').delete().eq('match_id', match.id);

    if (stats.length > 0) {
      const statRows = stats.map((s) => ({
        match_id: s.matchId,
        player_id: s.playerId,
        team_id: s.teamId,
        bucks: s.bucks,
        result: s.result,
        is_queen_winner: s.isQueenWinner,
      }));
      await supabase.from('match_player_stats').insert(statRows);
    }

    // 3. Update tournament status
    const { data: tourney } = await supabase
      .from('tournaments')
      .select('id')
      .eq('id', tournamentId)
      .single();

    if (tourney) {
      await supabase
        .from('tournaments')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', tournamentId);
    }

    return true;
  } catch (err) {
    console.error('Error syncing match result to cloud:', err);
    return false;
  }
}

/** Push all local storage tournaments to Supabase in one batch */
export async function pushAllLocalToCloud(
  localTournaments: Record<string, { tournament: Tournament; matches: Match[]; matchPlayerStats: MatchPlayerStats[] }>
): Promise<{ success: number; failed: number }> {
  let success = 0;
  let failed = 0;

  for (const item of Object.values(localTournaments)) {
    const ok = await syncTournamentToCloud(item.tournament, item.matches);
    if (ok) {
      for (const m of item.matches) {
        if (m.status === 'COMPLETED') {
          const matchStats = item.matchPlayerStats.filter((s) => s.matchId === m.id);
          await syncMatchResultToCloud(item.tournament.id, m, matchStats);
        }
      }
      success++;
    } else {
      failed++;
    }
  }

  return { success, failed };
}
