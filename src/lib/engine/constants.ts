// ─────────────────────────────────────────────
// Antigravity — Constants & Configuration
// ─────────────────────────────────────────────

/**
 * Number of league matches for each player count.
 * Chosen so average games per player ≈ 3, without full round-robin.
 */
export const LEAGUE_MATCH_COUNTS: Record<number, number> = {
  4: 3,
  5: 4,
  6: 5,
  7: 6,
  8: 6,
  9: 7,
  10: 8,
};

/** Minimum and maximum player counts */
export const MIN_PLAYERS = 4;
export const MAX_PLAYERS = 10;

/** Players per match (2v2) */
export const PLAYERS_PER_MATCH = 4;
export const PLAYERS_PER_TEAM = 2;

/** Maximum consecutive rounds a player can sit on the bench */
export const MAX_BENCH_STREAK = 2;

/** Queen bonus bucks */
export const QUEEN_BONUS_BUCKS = 3;

/** Total carrom coins per side at game start (excluding queen) */
export const COINS_PER_SIDE = 9;

/** Knockout: number of players who advance */
export const KNOCKOUT_QUALIFIERS = 4;

/** Avatar color palette — assigned to players in order */
export const AVATAR_COLORS = [
  '#06b6d4', // cyan-500
  '#f59e0b', // amber-500
  '#10b981', // emerald-500
  '#f43f5e', // rose-500
  '#8b5cf6', // violet-500
  '#ec4899', // pink-500
  '#3b82f6', // blue-500
  '#14b8a6', // teal-500
  '#f97316', // orange-500
  '#6366f1', // indigo-500
];
