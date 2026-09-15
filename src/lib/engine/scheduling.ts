// ─────────────────────────────────────────────
// Antigravity — Scheduling Engine
// ─────────────────────────────────────────────
// Pure functions. No DB, no side effects.
// Generates a fair league schedule for 2v2 carrom
// with rotating partners/opponents.
// ─────────────────────────────────────────────

import type { ID, PlayerScheduleState, ScheduledRound } from './types';
import { MAX_BENCH_STREAK, PLAYERS_PER_MATCH } from './constants';

/**
 * Initialize scheduling state for all players.
 */
export function initializePlayerStates(playerIds: ID[]): Map<ID, PlayerScheduleState> {
  const states = new Map<ID, PlayerScheduleState>();
  for (const id of playerIds) {
    states.set(id, {
      playerId: id,
      playedCount: 0,
      benchStreak: 0,
      whiteCount: 0,
      partnerHistory: new Map(),
      opponentHistory: new Map(),
    });
  }
  return states;
}

/**
 * Select 4 players for the next round using fairness criteria:
 * 1. Force-select anyone with bench_streak >= MAX_BENCH_STREAK
 * 2. Sort remaining by (benchStreak DESC, playedCount ASC)
 * 3. Fill to 4 from the top of the sorted list
 */
export function selectPlayersForRound(
  playerIds: ID[],
  states: Map<ID, PlayerScheduleState>
): { selected: ID[]; benched: ID[] } {
  // Step 1: Force-select players who've been benched too long
  const forced: ID[] = [];
  const remaining: ID[] = [];

  for (const id of playerIds) {
    const state = states.get(id)!;
    if (state.benchStreak >= MAX_BENCH_STREAK) {
      forced.push(id);
    } else {
      remaining.push(id);
    }
  }

  // If we have more forced than slots, take those with highest bench streak,
  // then lowest played count
  if (forced.length > PLAYERS_PER_MATCH) {
    forced.sort((a, b) => {
      const sa = states.get(a)!;
      const sb = states.get(b)!;
      if (sb.benchStreak !== sa.benchStreak) return sb.benchStreak - sa.benchStreak;
      return sa.playedCount - sb.playedCount;
    });
    const overflow = forced.splice(PLAYERS_PER_MATCH);
    remaining.push(...overflow);
  }

  // Step 2: Sort remaining candidates by fairness priority
  remaining.sort((a, b) => {
    const sa = states.get(a)!;
    const sb = states.get(b)!;
    // Higher bench streak = higher priority
    if (sb.benchStreak !== sa.benchStreak) return sb.benchStreak - sa.benchStreak;
    // Lower played count = higher priority
    if (sa.playedCount !== sb.playedCount) return sa.playedCount - sb.playedCount;
    // Tiebreak: random-ish (deterministic by ID for reproducibility)
    return a.localeCompare(b);
  });

  // Step 3: Fill to PLAYERS_PER_MATCH
  const slotsToFill = PLAYERS_PER_MATCH - forced.length;
  const selected = [...forced, ...remaining.slice(0, slotsToFill)];
  const benched = remaining.slice(slotsToFill);

  return { selected, benched };
}

/**
 * All 3 possible ways to split 4 players into 2 teams of 2.
 * Returns array of [team1, team2] pairs.
 */
export function getAllTeamSplits(
  players: [ID, ID, ID, ID]
): Array<{ team1: [ID, ID]; team2: [ID, ID] }> {
  const [a, b, c, d] = players;
  return [
    { team1: [a, b], team2: [c, d] },
    { team1: [a, c], team2: [b, d] },
    { team1: [a, d], team2: [b, c] },
  ];
}

/**
 * Cost function for a given team split.
 * Penalizes repeated pairings (same partners or same opponents).
 * Lower cost = better split.
 */
export function evaluateSplitCost(
  split: { team1: [ID, ID]; team2: [ID, ID] },
  states: Map<ID, PlayerScheduleState>
): number {
  let cost = 0;

  // Penalty for repeated partners
  const partnerPairs: [ID, ID][] = [split.team1, split.team2];
  for (const [p1, p2] of partnerPairs) {
    const s1 = states.get(p1)!;
    const partnerCount = s1.partnerHistory.get(p2) ?? 0;
    cost += partnerCount * 10; // Heavy penalty for repeat partners
  }

  // Penalty for repeated opponents
  for (const attacker of split.team1) {
    for (const defender of split.team2) {
      const sa = states.get(attacker)!;
      const oppCount = sa.opponentHistory.get(defender) ?? 0;
      cost += oppCount * 5; // Moderate penalty for repeat opponents
    }
  }

  return cost;
}

/**
 * Choose the best 2v2 team split for the selected 4 players.
 * Minimizes repeated pairings via cost function.
 */
export function formTeams(
  selectedPlayers: ID[],
  states: Map<ID, PlayerScheduleState>
): { team1: [ID, ID]; team2: [ID, ID] } {
  const players = selectedPlayers as [ID, ID, ID, ID];
  const splits = getAllTeamSplits(players);

  let bestSplit = splits[0];
  let bestCost = Infinity;

  for (const split of splits) {
    const cost = evaluateSplitCost(split, states);
    if (cost < bestCost) {
      bestCost = cost;
      bestSplit = split;
    }
  }

  return bestSplit;
}

/**
 * Decide which team gets white (break).
 * Assign to the team whose players have the fewest combined white counts.
 */
export function assignWhite(
  team1: [ID, ID],
  team2: [ID, ID],
  states: Map<ID, PlayerScheduleState>
): 0 | 1 {
  const team1White = team1.reduce((sum, id) => sum + states.get(id)!.whiteCount, 0);
  const team2White = team2.reduce((sum, id) => sum + states.get(id)!.whiteCount, 0);
  return team1White <= team2White ? 0 : 1;
}

/**
 * Update player states after a round is scheduled.
 */
export function updateStatesAfterRound(
  states: Map<ID, PlayerScheduleState>,
  round: ScheduledRound
): void {
  const playing = new Set([...round.team1PlayerIds, ...round.team2PlayerIds]);
  const whiteTeam = round.whiteTeamIndex === 0 ? round.team1PlayerIds : round.team2PlayerIds;

  for (const [id, state] of states) {
    if (playing.has(id)) {
      state.playedCount += 1;
      state.benchStreak = 0;
    } else {
      state.benchStreak += 1;
    }
  }

  // Update white count for the team that got white
  for (const id of whiteTeam) {
    states.get(id)!.whiteCount += 1;
  }

  // Update partner + opponent histories
  const team1 = round.team1PlayerIds;
  const team2 = round.team2PlayerIds;

  // Partners
  incrementHistory(states, team1[0], 'partnerHistory', team1[1]);
  incrementHistory(states, team1[1], 'partnerHistory', team1[0]);
  incrementHistory(states, team2[0], 'partnerHistory', team2[1]);
  incrementHistory(states, team2[1], 'partnerHistory', team2[0]);

  // Opponents (each player on team1 faces each player on team2)
  for (const p1 of team1) {
    for (const p2 of team2) {
      incrementHistory(states, p1, 'opponentHistory', p2);
      incrementHistory(states, p2, 'opponentHistory', p1);
    }
  }
}

function incrementHistory(
  states: Map<ID, PlayerScheduleState>,
  playerId: ID,
  historyKey: 'partnerHistory' | 'opponentHistory',
  otherId: ID
): void {
  const state = states.get(playerId)!;
  const current = state[historyKey].get(otherId) ?? 0;
  state[historyKey].set(otherId, current + 1);
}

/**
 * Generate the full league schedule.
 * This is the main entry point for the scheduling engine.
 *
 * @param playerIds — list of player IDs (4–10)
 * @param matchCount — number of league matches to generate
 * @returns array of ScheduledRound objects
 */
export function generateLeagueSchedule(
  playerIds: ID[],
  matchCount: number
): ScheduledRound[] {
  const states = initializePlayerStates(playerIds);
  const rounds: ScheduledRound[] = [];

  for (let r = 1; r <= matchCount; r++) {
    const { selected, benched } = selectPlayersForRound(playerIds, states);
    const { team1, team2 } = formTeams(selected, states);
    const whiteTeamIndex = assignWhite(team1, team2, states);

    const round: ScheduledRound = {
      roundNumber: r,
      team1PlayerIds: team1,
      team2PlayerIds: team2,
      whiteTeamIndex,
      benchedPlayerIds: benched,
    };

    rounds.push(round);
    updateStatesAfterRound(states, round);
  }

  return rounds;
}

/**
 * Get schedule fairness stats (for debugging / display).
 */
export function getScheduleStats(
  playerIds: ID[],
  rounds: ScheduledRound[]
): Array<{
  playerId: ID;
  gamesPlayed: number;
  timesBenched: number;
  maxBenchStreak: number;
  timesWhite: number;
  uniquePartners: number;
  uniqueOpponents: number;
}> {
  const states = initializePlayerStates(playerIds);

  // Replay to gather stats
  const maxStreaks = new Map<ID, number>();
  for (const id of playerIds) maxStreaks.set(id, 0);

  for (const round of rounds) {
    updateStatesAfterRound(states, round);
    for (const id of playerIds) {
      const streak = states.get(id)!.benchStreak;
      if (streak > (maxStreaks.get(id) ?? 0)) {
        maxStreaks.set(id, streak);
      }
    }
  }

  return playerIds.map((id) => {
    const s = states.get(id)!;
    return {
      playerId: id,
      gamesPlayed: s.playedCount,
      timesBenched: rounds.length - s.playedCount,
      maxBenchStreak: maxStreaks.get(id) ?? 0,
      timesWhite: s.whiteCount,
      uniquePartners: s.partnerHistory.size,
      uniqueOpponents: s.opponentHistory.size,
    };
  });
}
