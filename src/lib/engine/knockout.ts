// ─────────────────────────────────────────────
// Antigravity — Knockout Engine
// ─────────────────────────────────────────────
// Generates semifinal and final bracket from
// top 4 ranked players. Pure functions.
// ─────────────────────────────────────────────

import type { ID, RankedPlayer, KnockoutBracket, KnockoutMatch, Team } from './types';

/**
 * Generate a unique ID (simple client-side UUID).
 * In production, Supabase generates these server-side.
 */
function generateId(): ID {
  return crypto.randomUUID();
}

function createTeam(playerIds: [ID, ID]): Team {
  return {
    id: generateId(),
    playerIds,
  };
}

/**
 * Generate knockout bracket from top 4 ranked players.
 *
 * Seeding (cross-seed for fairness):
 * - Semifinal 1: #1 + #4 vs #2 + #3
 * - Semifinal 2: N/A for 4 players — we use a different format
 *
 * Actually, for individual ranking with 4 players in 2v2:
 * - Semi 1: #1 paired with #4 vs #2 paired with #3
 * - Semi 2: #1 paired with #3 vs #2 paired with #4
 *   (This gives each top player 2 games with different partners)
 *
 * Simpler approach (adopted):
 * - Semi 1: #1 + #4 vs #2 + #3
 * - Final: Winners play one more match with reshuffled teams
 *
 * For clarity and excitement, we'll do:
 * - Semi 1: Seed #1 & #4 vs Seed #2 & #3
 * - Semi 2: Seed #1 & #3 vs Seed #2 & #4
 * - Final: The 2 players with most wins across semis team up vs the other 2
 *
 * But this gets complex. Let's use the simpler bracket:
 * - Semi 1: #1+#4 vs #2+#3 (cross-seed)
 * - If result is clear, the 2 standout individuals advance to final
 * - Final: Top 2 individuals from semis play a deciding match
 *
 * FINAL DESIGN (keeping it simple and fun):
 * - Semi 1: #1 & #4 vs #2 & #3
 * - Semi 2: #1 & #3 vs #2 & #4
 * - Final: Best 2 individuals (by semi bucks) vs other 2
 */
export function generateKnockoutBracket(
  topPlayers: RankedPlayer[]
): KnockoutBracket {
  if (topPlayers.length < 4) {
    throw new Error('Need at least 4 players for knockout');
  }

  const [p1, p2, p3, p4] = topPlayers.map((rp) => rp.player.id);

  // Semifinal 1: #1+#4 vs #2+#3
  const semi1: KnockoutMatch = {
    id: generateId(),
    round: 'SEMIFINAL_1',
    team1: createTeam([p1, p4]),
    team2: createTeam([p2, p3]),
    status: 'UPCOMING',
  };

  // Semifinal 2: #1+#3 vs #2+#4
  const semi2: KnockoutMatch = {
    id: generateId(),
    round: 'SEMIFINAL_2',
    team1: createTeam([p1, p3]),
    team2: createTeam([p2, p4]),
    status: 'UPCOMING',
  };

  return {
    semifinal1: semi1,
    semifinal2: semi2,
    final: null, // Generated after semis complete
  };
}

/**
 * Generate the final match based on semifinal results.
 * The 2 players with the most combined bucks across both semis
 * team up against the other 2.
 */
export function generateFinalMatch(
  bracket: KnockoutBracket,
  semiBucks: Map<ID, number>
): KnockoutMatch {
  // Get all 4 player IDs
  const allPlayerIds = new Set<ID>();
  for (const pid of bracket.semifinal1.team1.playerIds) allPlayerIds.add(pid);
  for (const pid of bracket.semifinal1.team2.playerIds) allPlayerIds.add(pid);

  // Sort by semi bucks (desc)
  const sorted = [...allPlayerIds].sort((a, b) => {
    return (semiBucks.get(b) ?? 0) - (semiBucks.get(a) ?? 0);
  });

  const finalMatch: KnockoutMatch = {
    id: generateId(),
    round: 'FINAL',
    team1: createTeam([sorted[0], sorted[1]]),
    team2: createTeam([sorted[2], sorted[3]]),
    status: 'UPCOMING',
  };

  return finalMatch;
}

/**
 * Determine the tournament champion from the final result.
 * Returns the player IDs of the winning team.
 */
export function determineTournamentChampions(
  finalMatch: KnockoutMatch
): ID[] | null {
  if (finalMatch.status !== 'COMPLETED' || !finalMatch.winnerTeamId) {
    return null;
  }

  if (finalMatch.winnerTeamId === finalMatch.team1.id) {
    return [...finalMatch.team1.playerIds];
  }
  return [...finalMatch.team2.playerIds];
}
