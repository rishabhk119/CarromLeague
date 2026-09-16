// ─────────────────────────────────────────────
// Antigravity — Local & Cloud Tournament Store
// ─────────────────────────────────────────────
// In-memory state with localStorage persistence & automatic Supabase cloud sync.
// ─────────────────────────────────────────────

import type {
  Player,
  Tournament,
  TournamentStatus,
  TournamentConfig,
  Match,
  MatchStatus,
  MatchPlayerStats,
  KnockoutBracket,
  KnockoutMatch,
  RankedPlayer,
} from '@/lib/engine/types';
import { AVATAR_COLORS, LEAGUE_MATCH_COUNTS, KNOCKOUT_QUALIFIERS } from '@/lib/engine/constants';
import { generateLeagueSchedule } from '@/lib/engine/scheduling';
import { calculateMatchBucks, determineWinner, type BoardResult } from '@/lib/engine/scoring';
import { computeRankings, getTopPlayers } from '@/lib/engine/ranking';
import { generateKnockoutBracket, generateFinalMatch } from '@/lib/engine/knockout';
import { syncTournamentToCloud, syncMatchResultToCloud } from '@/lib/supabase';

// ── Types for the store ─────────────────────

export interface StoredTournament {
  tournament: Tournament;
  matches: Match[];
  matchPlayerStats: MatchPlayerStats[];
  knockoutBracket: KnockoutBracket | null;
}

export interface StoreState {
  tournaments: Record<string, StoredTournament>;
}

// ── Storage key ─────────────────────────────
const STORAGE_KEY = 'carromleague_store';
const LEGACY_STORAGE_KEY = 'antigravity_store';

// ── Helpers ─────────────────────────────────
function generateId(): string {
  return crypto.randomUUID();
}

export function loadState(): StoreState {
  if (typeof window === 'undefined') {
    return { tournaments: {} };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore parse errors
  }
  return { tournaments: {} };
}

export function saveState(state: StoreState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore quota errors
  }
}

// ── Store API ───────────────────────────────

/** Create a new tournament */
export function createTournament(name: string, playerNames: string[]): Tournament {
  const state = loadState();

  const players: Player[] = playerNames.map((pName, i) => ({
    id: generateId(),
    name: pName.trim(),
    avatarColor: AVATAR_COLORS[i % AVATAR_COLORS.length],
  }));

  const config: TournamentConfig = {
    playerCount: players.length,
    leagueMatches: LEAGUE_MATCH_COUNTS[players.length] ?? 6,
    format: '2v2',
  };

  const tournament: Tournament = {
    id: generateId(),
    name: name.trim(),
    status: 'DRAFT',
    config,
    players,
    createdAt: new Date().toISOString(),
  };

  state.tournaments[tournament.id] = {
    tournament,
    matches: [],
    matchPlayerStats: [],
    knockoutBracket: null,
  };

  saveState(state);
  syncTournamentToCloud(tournament, []).catch(() => {});
  return tournament;
}

/** Get a tournament by ID */
export function getTournament(id: string): StoredTournament | null {
  const state = loadState();
  return state.tournaments[id] ?? null;
}

/** List all tournaments */
export function listTournaments(): Tournament[] {
  const state = loadState();
  return Object.values(state.tournaments)
    .map((st) => st.tournament)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

/** Get all tournaments with full data (for History & Cloud sync) */
export function getAllStoredData(): Record<string, StoredTournament> {
  const state = loadState();
  return state.tournaments;
}

/** Delete a tournament */
export function deleteTournament(id: string): void {
  const state = loadState();
  delete state.tournaments[id];
  saveState(state);
}

/** Import or restore tournament state */
export function importState(importedTournaments: Record<string, StoredTournament>): void {
  const state = loadState();
  state.tournaments = {
    ...state.tournaments,
    ...importedTournaments,
  };
  saveState(state);
}

/** Generate league matches for a tournament */
export function generateLeague(tournamentId: string): Match[] {
  const state = loadState();
  const stored = state.tournaments[tournamentId];
  if (!stored) throw new Error('Tournament not found');

  const { tournament } = stored;
  const playerIds = tournament.players.map((p) => p.id);
  const rounds = generateLeagueSchedule(playerIds, tournament.config.leagueMatches);

  const stageId = generateId();
  const matches: Match[] = rounds.map((round) => ({
    id: generateId(),
    stageId,
    roundNumber: round.roundNumber,
    team1: {
      id: generateId(),
      playerIds: round.team1PlayerIds,
    },
    team2: {
      id: generateId(),
      playerIds: round.team2PlayerIds,
    },
    status: 'UPCOMING' as MatchStatus,
    whiteTeamId: undefined,
  }));

  // Set white team ID
  rounds.forEach((round, i) => {
    const match = matches[i];
    match.whiteTeamId = round.whiteTeamIndex === 0 ? match.team1.id : match.team2.id;
  });

  stored.matches = matches;
  stored.tournament.status = 'LEAGUE_ACTIVE';
  saveState(state);

  // Sync to cloud
  syncTournamentToCloud(stored.tournament, stored.matches).catch(() => {});

  return matches;
}

/** Get all matches for a tournament */
export function getMatches(tournamentId: string): Match[] {
  const stored = getTournament(tournamentId);
  if (!stored) return [];
  return stored.matches;
}

/** Get a specific match */
export function getMatch(tournamentId: string, matchId: string): Match | null {
  const stored = getTournament(tournamentId);
  if (!stored) return null;
  return stored.matches.find((m) => m.id === matchId) ?? null;
}

/** Submit match result */
export function submitMatchResult(
  tournamentId: string,
  matchId: string,
  team1CoinsLeft: number,
  team2CoinsLeft: number,
  queenCoveredBy: string | null
): MatchPlayerStats[] {
  const state = loadState();
  const stored = state.tournaments[tournamentId];
  if (!stored) throw new Error('Tournament not found');

  const match = stored.matches.find((m) => m.id === matchId);
  if (!match) throw new Error('Match not found');

  const boardResult: BoardResult = {
    matchId,
    team1PlayerIds: match.team1.playerIds,
    team2PlayerIds: match.team2.playerIds,
    team1Id: match.team1.id,
    team2Id: match.team2.id,
    team1CoinsLeft,
    team2CoinsLeft,
    queenCoveredBy,
  };

  const stats = calculateMatchBucks(boardResult);
  const winnerId = determineWinner(boardResult);

  match.status = 'COMPLETED';
  match.winnerTeamId = winnerId ?? undefined;

  // Remove any existing stats for this match (in case of re-submit)
  stored.matchPlayerStats = stored.matchPlayerStats.filter((s) => s.matchId !== matchId);
  stored.matchPlayerStats.push(...stats);

  // Check if all league matches are completed
  const leagueMatchCount = stored.tournament.config.leagueMatches;
  const leagueMatches = stored.matches.slice(0, leagueMatchCount);
  const allLeagueDone = leagueMatches.every((m) => m.status === 'COMPLETED');
  if (allLeagueDone && stored.tournament.status === 'LEAGUE_ACTIVE') {
    stored.tournament.status = 'LEAGUE_COMPLETE';
  }

  // Check if all knockout matches are completed
  if (stored.knockoutBracket) {
    const knockoutMatches = stored.matches.slice(leagueMatchCount);
    const allKnockoutDone = knockoutMatches.length > 0 && knockoutMatches.every((m) => m.status === 'COMPLETED');
    if (allKnockoutDone && stored.tournament.status === 'KNOCKOUT_ACTIVE') {
      stored.tournament.status = 'COMPLETE';
    }
  }

  saveState(state);

  // Sync to cloud
  syncMatchResultToCloud(tournamentId, match, stats).catch(() => {});

  return stats;
}

/** Get rankings for a tournament */
export function getRankings(tournamentId: string): RankedPlayer[] {
  const stored = getTournament(tournamentId);
  if (!stored) return [];
  return computeRankings(stored.tournament.players, stored.matchPlayerStats);
}

/** Generate knockout bracket */
export function generateKnockout(tournamentId: string): KnockoutBracket {
  const state = loadState();
  const stored = state.tournaments[tournamentId];
  if (!stored) throw new Error('Tournament not found');

  const rankings = computeRankings(stored.tournament.players, stored.matchPlayerStats);
  const topPlayers = getTopPlayers(rankings, KNOCKOUT_QUALIFIERS);
  const bracket = generateKnockoutBracket(topPlayers);

  // Convert knockout matches to regular matches and add to the match list
  const knockoutMatches: Match[] = [
    { ...bracket.semifinal1, stageId: generateId(), roundNumber: stored.matches.length + 1 },
    { ...bracket.semifinal2, stageId: generateId(), roundNumber: stored.matches.length + 2 },
  ];

  stored.matches.push(...(knockoutMatches as any));
  stored.knockoutBracket = bracket;
  stored.tournament.status = 'KNOCKOUT_ACTIVE';

  saveState(state);

  // Sync to cloud
  syncTournamentToCloud(stored.tournament, stored.matches).catch(() => {});

  return bracket;
}

/** Generate the final match after semis */
export function generateFinal(tournamentId: string): KnockoutMatch {
  const state = loadState();
  const stored = state.tournaments[tournamentId];
  if (!stored || !stored.knockoutBracket) throw new Error('Knockout not started');

  // Collect semi bucks
  const semiBucks = new Map<string, number>();
  const semiMatchIds = new Set([
    stored.knockoutBracket.semifinal1.id,
    stored.knockoutBracket.semifinal2.id,
  ]);

  for (const stat of stored.matchPlayerStats) {
    if (semiMatchIds.has(stat.matchId)) {
      semiBucks.set(stat.playerId, (semiBucks.get(stat.playerId) ?? 0) + stat.bucks);
    }
  }

  const finalMatch = generateFinalMatch(stored.knockoutBracket, semiBucks);
  stored.knockoutBracket.final = finalMatch;

  // Add final to matches
  stored.matches.push({
    ...finalMatch,
    stageId: generateId(),
    roundNumber: stored.matches.length + 1,
  } as any);

  saveState(state);

  // Sync to cloud
  syncTournamentToCloud(stored.tournament, stored.matches).catch(() => {});

  return finalMatch;
}

/** Get match stats for a specific match */
export function getMatchStats(tournamentId: string, matchId: string): MatchPlayerStats[] {
  const stored = getTournament(tournamentId);
  if (!stored) return [];
  return stored.matchPlayerStats.filter((s) => s.matchId === matchId);
}

/** Get the knockout bracket */
export function getKnockoutBracket(tournamentId: string): KnockoutBracket | null {
  const stored = getTournament(tournamentId);
  if (!stored) return null;
  return stored.knockoutBracket;
}

/** Update tournament status */
export function updateTournamentStatus(tournamentId: string, status: TournamentStatus): void {
  const state = loadState();
  const stored = state.tournaments[tournamentId];
  if (!stored) throw new Error('Tournament not found');
  stored.tournament.status = status;
  saveState(state);
}
