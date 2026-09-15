// ─────────────────────────────────────────────
// Antigravity — Ranking Engine
// ─────────────────────────────────────────────
// Pure functions for computing player rankings.
// ─────────────────────────────────────────────

import type { Player, MatchPlayerStats, RankedPlayer } from './types';

export interface PlayerAggregateStats {
  playerId: string;
  totalBucks: number;
  wins: number;
  losses: number;
  gamesPlayed: number;
  queensWon: number;
}

/**
 * Aggregate individual match stats into per-player tournament stats.
 */
export function aggregatePlayerStats(
  allMatchStats: MatchPlayerStats[]
): Map<string, PlayerAggregateStats> {
  const statsMap = new Map<string, PlayerAggregateStats>();

  for (const ms of allMatchStats) {
    let agg = statsMap.get(ms.playerId);
    if (!agg) {
      agg = {
        playerId: ms.playerId,
        totalBucks: 0,
        wins: 0,
        losses: 0,
        gamesPlayed: 0,
        queensWon: 0,
      };
      statsMap.set(ms.playerId, agg);
    }

    agg.totalBucks += ms.bucks;
    agg.gamesPlayed += 1;
    if (ms.result === 'WIN') agg.wins += 1;
    else agg.losses += 1;
    if (ms.isQueenWinner) agg.queensWon += 1;
  }

  return statsMap;
}

/**
 * Compute ranked player list from aggregate stats.
 *
 * Sort order:
 * 1. Total bucks (DESC) — primary metric
 * 2. Wins (DESC) — tiebreaker #1
 * 3. Games played (ASC) — fewer games = more efficient, tiebreaker #2
 * 4. Player name (ASC) — final deterministic tiebreaker
 */
export function computeRankings(
  players: Player[],
  allMatchStats: MatchPlayerStats[]
): RankedPlayer[] {
  const statsMap = aggregatePlayerStats(allMatchStats);

  const ranked: RankedPlayer[] = players.map((player) => {
    const agg = statsMap.get(player.id);
    const totalBucks = agg?.totalBucks ?? 0;
    const wins = agg?.wins ?? 0;
    const losses = agg?.losses ?? 0;
    const gamesPlayed = agg?.gamesPlayed ?? 0;

    return {
      player,
      rank: 0, // will be set below
      totalBucks,
      wins,
      losses,
      gamesPlayed,
      avgBucks: gamesPlayed > 0 ? Math.round((totalBucks / gamesPlayed) * 10) / 10 : 0,
    };
  });

  // Sort
  ranked.sort((a, b) => {
    if (b.totalBucks !== a.totalBucks) return b.totalBucks - a.totalBucks;
    if (b.wins !== a.wins) return b.wins - a.wins;
    if (a.gamesPlayed !== b.gamesPlayed) return a.gamesPlayed - b.gamesPlayed;
    return a.player.name.localeCompare(b.player.name);
  });

  // Assign ranks (handle ties — same rank for same stats)
  for (let i = 0; i < ranked.length; i++) {
    if (
      i > 0 &&
      ranked[i].totalBucks === ranked[i - 1].totalBucks &&
      ranked[i].wins === ranked[i - 1].wins
    ) {
      ranked[i].rank = ranked[i - 1].rank; // tied
    } else {
      ranked[i].rank = i + 1;
    }
  }

  return ranked;
}

/**
 * Get the top N players for knockout qualification.
 */
export function getTopPlayers(
  rankings: RankedPlayer[],
  count: number
): RankedPlayer[] {
  return rankings.slice(0, count);
}
