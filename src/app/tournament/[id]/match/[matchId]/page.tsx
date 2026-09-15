"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  getTournament,
  getMatch,
  getMatchStats,
  submitMatchResult,
} from "@/lib/store";
import type { Tournament, Match, MatchPlayerStats } from "@/lib/engine/types";
import { ScoreInput } from "@/components/tournament/ScoreInput";
import { PlayerBadge } from "@/components/tournament/PlayerBadge";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  ArrowLeft,
  CheckCircle2,
  Swords,
  Crown,
  Trophy,
  ArrowRight,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { triggerConfetti } from "@/lib/confetti";
import { playVictoryFanfare } from "@/lib/audio";
import Link from "next/link";
import { motion } from "framer-motion";

export default function MatchScorerPage() {
  const params = useParams<{ id: string; matchId: string }>();
  const router = useRouter();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [match, setMatch] = useState<Match | null>(null);
  const [stats, setStats] = useState<MatchPlayerStats[]>([]);
  const [mounted, setMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [justSubmitted, setJustSubmitted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const refresh = useCallback(() => {
    const stored = getTournament(params.id);
    if (!stored) {
      router.push("/");
      return;
    }
    setTournament(stored.tournament);

    const m = stored.matches.find((m) => m.id === params.matchId);
    if (!m) {
      router.push(`/tournament/${params.id}`);
      return;
    }
    setMatch(m);
    setStats(stored.matchPlayerStats.filter((s) => s.matchId === params.matchId));
  }, [params.id, params.matchId, router]);

  useEffect(() => {
    setMounted(true);
    refresh();
  }, [refresh]);

  const handleSubmit = (
    team1CoinsLeft: number,
    team2CoinsLeft: number,
    queenCoveredBy: string | null
  ) => {
    setIsSubmitting(true);
    try {
      const result = submitMatchResult(
        params.id,
        params.matchId,
        team1CoinsLeft,
        team2CoinsLeft,
        queenCoveredBy
      );
      setStats(result);
      setJustSubmitted(true);
      setIsEditing(false);
      triggerConfetti(2500);
      playVictoryFanfare();
      refresh();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mounted || !tournament || !match) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 rounded-lg bg-white/5" />
          <div className="h-64 rounded-2xl bg-white/5" />
        </div>
      </div>
    );
  }

  const playerMap = new Map(tournament.players.map((p) => [p.id, p]));
  const isCompleted = match.status === "COMPLETED";

  // Find next upcoming match if any
  const nextMatch = tournament
    ? getTournament(tournament.id)?.matches.find(
        (m) => m.status === "UPCOMING" && m.id !== match.id
      )
    : null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      {/* Back link */}
      <Link
        href={`/tournament/${params.id}`}
        className="mb-6 inline-flex items-center gap-1.5 text-xs sm:text-sm text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to {tournament.name} Hub
      </Link>

      {/* Match header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center gap-3 mb-1.5">
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Round {match.roundNumber}
          </h1>
          {isCompleted && !isEditing ? (
            <Badge variant="success">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Completed
            </Badge>
          ) : (
            <Badge variant="purple">
              <Swords className="h-3 w-3 mr-1" />
              Live Scoring
            </Badge>
          )}
        </div>
        <p className="text-xs sm:text-sm text-slate-400">
          {tournament.name} — Match {match.roundNumber} of {tournament.config.leagueMatches + 3}
        </p>
      </div>

      {/* Completed match result scorecard */}
      {isCompleted && !isEditing && stats.length > 0 ? (
        <div className="space-y-6">
          {/* Success banner */}
          {justSubmitted && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="glass-card glow-emerald p-5 text-center border border-emerald-500/40 bg-emerald-950/20"
            >
              <CheckCircle2 className="h-9 w-9 text-emerald-400 mx-auto mb-2 animate-bounce" />
              <p className="text-lg font-black text-emerald-300">
                Match Result Recorded!
              </p>
              <p className="text-xs text-emerald-400/80 mt-0.5">
                Player bucks and tournament standings updated.
              </p>
            </motion.div>
          )}

          {/* Result Card */}
          <div className="glass-card p-5 sm:p-7 border border-white/15">
            <div className="flex items-center justify-between gap-3 mb-6">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Trophy className="h-4 w-4" />
                </div>
                <h2 className="text-lg font-black text-white">Match Scorecard</h2>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="text-xs"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Edit Scores
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Team 1 */}
              <div
                className={cn(
                  "rounded-2xl border p-4 transition-all",
                  match.winnerTeamId === match.team1.id
                    ? "border-emerald-500/40 bg-emerald-950/25 shadow-lg shadow-emerald-950/30"
                    : "border-white/10 bg-white/[0.02]"
                )}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-white border border-slate-300 shadow-sm" />
                    <span className="text-xs font-bold uppercase text-slate-300">Team 1</span>
                  </div>
                  {match.winnerTeamId === match.team1.id && (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                      <Crown className="h-3 w-3 text-amber-400" />
                      Won
                    </span>
                  )}
                </div>

                <div className="space-y-3">
                  {match.team1.playerIds.map((pid) => {
                    const player = playerMap.get(pid);
                    const playerStats = stats.find((s) => s.playerId === pid);
                    if (!player) return null;
                    return (
                      <div key={pid} className="flex items-center justify-between">
                        <PlayerBadge player={player} size="sm" />
                        <div className="flex items-center gap-2">
                          {playerStats?.isQueenWinner && (
                            <span className="text-[10px] text-rose-400 font-bold flex items-center gap-0.5 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20">
                              <Crown className="h-3 w-3" /> Queen
                            </span>
                          )}
                          <span className="text-lg font-black tabular-nums text-amber-400">
                            +{playerStats?.bucks ?? 0}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Team 2 */}
              <div
                className={cn(
                  "rounded-2xl border p-4 transition-all",
                  match.winnerTeamId === match.team2.id
                    ? "border-emerald-500/40 bg-emerald-950/25 shadow-lg shadow-emerald-950/30"
                    : "border-white/10 bg-white/[0.02]"
                )}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-slate-900 border border-slate-600 shadow-sm" />
                    <span className="text-xs font-bold uppercase text-slate-300">Team 2</span>
                  </div>
                  {match.winnerTeamId === match.team2.id && (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                      <Crown className="h-3 w-3 text-amber-400" />
                      Won
                    </span>
                  )}
                </div>

                <div className="space-y-3">
                  {match.team2.playerIds.map((pid) => {
                    const player = playerMap.get(pid);
                    const playerStats = stats.find((s) => s.playerId === pid);
                    if (!player) return null;
                    return (
                      <div key={pid} className="flex items-center justify-between">
                        <PlayerBadge player={player} size="sm" />
                        <div className="flex items-center gap-2">
                          {playerStats?.isQueenWinner && (
                            <span className="text-[10px] text-rose-400 font-bold flex items-center gap-0.5 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20">
                              <Crown className="h-3 w-3" /> Queen
                            </span>
                          )}
                          <span className="text-lg font-black tabular-nums text-amber-400">
                            +{playerStats?.bucks ?? 0}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href={`/tournament/${params.id}`} className="w-full sm:w-auto">
              <Button variant="secondary" size="lg" className="w-full">
                <ArrowLeft className="h-4 w-4" />
                Tournament Hub
              </Button>
            </Link>

            {nextMatch && (
              <Link
                href={`/tournament/${params.id}/match/${nextMatch.id}`}
                className="w-full sm:w-auto"
              >
                <Button variant="gold" size="lg" className="w-full">
                  Next Match (R{nextMatch.roundNumber})
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      ) : (
        /* Score input form */
        <ScoreInput
          match={match}
          players={tournament.players}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
}
