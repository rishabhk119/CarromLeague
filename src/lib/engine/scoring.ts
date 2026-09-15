// ─────────────────────────────────────────────
// Antigravity — Scoring Service
// ─────────────────────────────────────────────
// Pure functions for carrom bucks calculation.
// ─────────────────────────────────────────────

import type { ID, MatchPlayerStats, MatchResult } from './types';
import { QUEEN_BONUS_BUCKS } from './constants';

export interface BoardResult {
  matchId: ID;
  /** Players on team 1 */
  team1PlayerIds: [ID, ID];
  /** Players on team 2 */
  team2PlayerIds: [ID, ID];
  /** Team IDs */
  team1Id: ID;
  team2Id: ID;
  /** Total coins left on board for team 1's side (coins they failed to pocket) */
  team1CoinsLeft: number;
  /** Total coins left on board for team 2's side */
  team2CoinsLeft: number;
  /** Player who pocketed and covered the queen, null if no one */
  queenCoveredBy: ID | null;
}

/**
 * Calculate bucks for each player from a board result.
 *
 * Scoring rules:
 * - Each player on the winning team earns bucks = opponent team's coins left
 * - Each player on the losing team earns 0 bucks
 * - The player who covered the queen earns +3 bonus bucks
 * - If coins are equal, it's a draw — both teams earn opponent's coins
 *
 * The team with fewer coins left wins (they pocketed more).
 */
export function calculateMatchBucks(result: BoardResult): MatchPlayerStats[] {
  const stats: MatchPlayerStats[] = [];

  // Team with fewer coins left wins (they pocketed more of their own coins)
  const team1Wins = result.team1CoinsLeft < result.team2CoinsLeft;
  const team2Wins = result.team2CoinsLeft < result.team1CoinsLeft;
  const isDraw = result.team1CoinsLeft === result.team2CoinsLeft;

  // Bucks = opponent's remaining coins (how many they failed to pocket)
  // Winner gets opponent's coins left as bucks
  // Loser gets 0
  // Draw: both get opponent's coins
  for (const playerId of result.team1PlayerIds) {
    let bucks = 0;
    let matchResult: MatchResult;

    if (team1Wins || isDraw) {
      bucks = result.team2CoinsLeft; // earn opponent's remaining coins
    }

    if (team1Wins) {
      matchResult = 'WIN';
    } else if (team2Wins) {
      matchResult = 'LOSS';
    } else {
      matchResult = 'WIN'; // draw counts as win for both for simplicity
    }

    // Queen bonus
    const isQueenWinner = result.queenCoveredBy === playerId;
    if (isQueenWinner) {
      bucks += QUEEN_BONUS_BUCKS;
    }

    stats.push({
      matchId: result.matchId,
      playerId,
      teamId: result.team1Id,
      bucks,
      result: matchResult,
      isQueenWinner,
    });
  }

  for (const playerId of result.team2PlayerIds) {
    let bucks = 0;
    let matchResult: MatchResult;

    if (team2Wins || isDraw) {
      bucks = result.team1CoinsLeft;
    }

    if (team2Wins) {
      matchResult = 'WIN';
    } else if (team1Wins) {
      matchResult = 'LOSS';
    } else {
      matchResult = 'WIN';
    }

    const isQueenWinner = result.queenCoveredBy === playerId;
    if (isQueenWinner) {
      bucks += QUEEN_BONUS_BUCKS;
    }

    stats.push({
      matchId: result.matchId,
      playerId,
      teamId: result.team2Id,
      bucks,
      result: matchResult,
      isQueenWinner,
    });
  }

  return stats;
}

/**
 * Determine the winning team ID from a board result.
 * Returns null for a draw.
 */
export function determineWinner(result: BoardResult): ID | null {
  if (result.team1CoinsLeft < result.team2CoinsLeft) return result.team1Id;
  if (result.team2CoinsLeft < result.team1CoinsLeft) return result.team2Id;
  return null; // draw
}

/**
 * Validate a board result input.
 */
export function validateBoardResult(result: BoardResult): string[] {
  const errors: string[] = [];

  if (result.team1CoinsLeft < 0 || result.team1CoinsLeft > 9) {
    errors.push('Team 1 coins left must be between 0 and 9');
  }
  if (result.team2CoinsLeft < 0 || result.team2CoinsLeft > 9) {
    errors.push('Team 2 coins left must be between 0 and 9');
  }
  if (result.team1PlayerIds.length !== 2) {
    errors.push('Team 1 must have exactly 2 players');
  }
  if (result.team2PlayerIds.length !== 2) {
    errors.push('Team 2 must have exactly 2 players');
  }

  // Queen coverer must be one of the 4 players
  if (result.queenCoveredBy !== null) {
    const allPlayers = [...result.team1PlayerIds, ...result.team2PlayerIds];
    if (!allPlayers.includes(result.queenCoveredBy)) {
      errors.push('Queen coverer must be one of the 4 match players');
    }
  }

  return errors;
}
