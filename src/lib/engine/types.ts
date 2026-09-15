// ─────────────────────────────────────────────
// Antigravity — Core Types
// ─────────────────────────────────────────────

/** Unique identifier type (UUID string from Supabase) */
export type ID = string;

// ── Player ──────────────────────────────────

export interface Player {
  id: ID;
  name: string;
  /** CSS-safe color for avatar badge */
  avatarColor: string;
}

// ── Tournament ──────────────────────────────

export type TournamentStatus =
  | 'DRAFT'
  | 'LEAGUE_ACTIVE'
  | 'LEAGUE_COMPLETE'
  | 'KNOCKOUT_ACTIVE'
  | 'COMPLETE';

export interface TournamentConfig {
  playerCount: number;
  leagueMatches: number;
  format: '2v2';
}

export interface Tournament {
  id: ID;
  name: string;
  status: TournamentStatus;
  config: TournamentConfig;
  players: Player[];
  createdAt: string;
}

// ── Stage ───────────────────────────────────

export type StageType = 'LEAGUE' | 'KNOCKOUT';

export interface Stage {
  id: ID;
  tournamentId: ID;
  type: StageType;
  order: number;
}

// ── Team (ephemeral per match) ──────────────

export interface Team {
  id: ID;
  playerIds: [ID, ID];
}

// ── Match ───────────────────────────────────

export type MatchStatus = 'UPCOMING' | 'LIVE' | 'COMPLETED';

export interface Match {
  id: ID;
  stageId: ID;
  roundNumber: number;
  team1: Team;
  team2: Team;
  status: MatchStatus;
  winnerTeamId?: ID;
  /** Which team plays white/break */
  whiteTeamId?: ID;
}

// ── Scoring ─────────────────────────────────

export type MatchResult = 'WIN' | 'LOSS';

export interface MatchPlayerStats {
  matchId: ID;
  playerId: ID;
  teamId: ID;
  /** Bucks earned this match (opponent coins left + queen bonus) */
  bucks: number;
  result: MatchResult;
  /** Did this player pocket and cover the queen? */
  isQueenWinner: boolean;
}

/** Raw input from the scorer UI */
export interface MatchScoreInput {
  matchId: ID;
  /** Coins remaining for each player on the losing side */
  team1CoinsLeft: number;
  team2CoinsLeft: number;
  /** Player ID who covered the queen (null if nobody did) */
  queenCoveredBy: ID | null;
}

// ── Ranking ─────────────────────────────────

export interface RankedPlayer {
  player: Player;
  rank: number;
  totalBucks: number;
  wins: number;
  losses: number;
  gamesPlayed: number;
  /** Average bucks per game */
  avgBucks: number;
}

// ── Knockout ────────────────────────────────

export type KnockoutRound = 'SEMIFINAL_1' | 'SEMIFINAL_2' | 'FINAL';

export interface KnockoutMatch {
  id: ID;
  round: KnockoutRound;
  team1: Team;
  team2: Team;
  status: MatchStatus;
  winnerTeamId?: ID;
}

export interface KnockoutBracket {
  semifinal1: KnockoutMatch;
  semifinal2: KnockoutMatch;
  final: KnockoutMatch | null;
}

// ── Scheduling internals ────────────────────

export interface PlayerScheduleState {
  playerId: ID;
  playedCount: number;
  benchStreak: number;
  whiteCount: number;
  /** Track partner history: partnerId → count */
  partnerHistory: Map<ID, number>;
  /** Track opponent history: opponentId → count */
  opponentHistory: Map<ID, number>;
}

export interface ScheduledRound {
  roundNumber: number;
  team1PlayerIds: [ID, ID];
  team2PlayerIds: [ID, ID];
  whiteTeamIndex: 0 | 1;
  benchedPlayerIds: ID[];
}
