"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  getTournament,
  getMatches,
  getRankings,
  getMatchStats,
  generateKnockout,
  generateFinal,
  getKnockoutBracket,
  deleteTournament,
} from "@/lib/store";
import type { Tournament, Match, MatchPlayerStats, RankedPlayer } from "@/lib/engine/types";
import { MatchCard } from "@/components/tournament/MatchCard";
import { StandingsTable } from "@/components/tournament/StandingsTable";
import { BracketVisual } from "@/components/tournament/BracketVisual";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  ArrowLeft,
  Trophy,
  Swords,
  BarChart3,
  Crown,
  Zap,
  Users,
  Flame,
  Trash2,
  GitBranch,
} from "lucide-react";
import { cn, pluralize } from "@/lib/utils";
import { triggerConfetti } from "@/lib/confetti";
import { playVictoryFanfare } from "@/lib/audio";
import Link from "next/link";
import { motion } from "framer-motion";

type Tab = "matches" | "standings" | "bracket";

const STATUS_CONFIG: Record<
  string,
  { label: string; shortLabel: string; variant: "default" | "success" | "warning" | "danger" | "info" | "purple" | "gold" }
> = {
  DRAFT: { label: "Draft", shortLabel: "Draft", variant: "default" },
  LEAGUE_ACTIVE: { label: "League In Progress", shortLabel: "League", variant: "purple" },
  LEAGUE_COMPLETE: { label: "League Finished — Start Knockout", shortLabel: "League Done", variant: "warning" },
  KNOCKOUT_ACTIVE: { label: "Knockout Stage", shortLabel: "Knockout", variant: "warning" },
  COMPLETE: { label: "Tournament Complete", shortLabel: "Complete", variant: "gold" },
};

export default function TournamentHubPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [rankings, setRankings] = useState<RankedPlayer[]>([]);
  const [allStats, setAllStats] = useState<MatchPlayerStats[]>([]);
  const [tab, setTab] = useState<Tab>("matches");
  const [mounted, setMounted] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const refresh = useCallback(() => {
    const stored = getTournament(params.id);
    if (!stored) {
      router.push("/");
      return;
    }
    setTournament(stored.tournament);
    setMatches(stored.matches);
    setRankings(getRankings(params.id));
    setAllStats(stored.matchPlayerStats);
  }, [params.id, router]);

  useEffect(() => {
    setMounted(true);
    refresh();
  }, [refresh]);

  // Celebrate if just arrived on a completed tournament
  useEffect(() => {
    if (tournament?.status === "COMPLETE") {
      triggerConfetti(2000);
      playVictoryFanfare();
    }
  }, [tournament?.status]);

  const handleGenerateKnockout = () => {
    try {
      generateKnockout(params.id);
      refresh();
      setTab("bracket");
      triggerConfetti(1500);
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleGenerateFinal = () => {
    try {
      generateFinal(params.id);
      refresh();
      setTab("bracket");
      triggerConfetti(1500);
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleDelete = () => {
    deleteTournament(params.id);
    router.push("/");
  };

  if (!mounted || !tournament) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8 sm:py-12 sm:px-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-64 rounded-lg bg-white/5" />
          <div className="h-48 rounded-2xl bg-white/5" />
        </div>
      </div>
    );
  }

  const statusConfig = STATUS_CONFIG[tournament.status] ?? STATUS_CONFIG.DRAFT;
  const completedMatches = matches.filter((m) => m.status === "COMPLETED");
  const upcomingMatches = matches.filter((m) => m.status === "UPCOMING");
  const nextMatch = upcomingMatches[0];

  const bracket = getKnockoutBracket(params.id);
  const semisCompleted =
    bracket &&
    bracket.semifinal1.status === "COMPLETED" &&
    bracket.semifinal2.status === "COMPLETED";
  const needsFinal = semisCompleted && !bracket?.final;

  const totalBucksScored = allStats.reduce((sum, s) => sum + s.bucks, 0);
  const queensCaptured = allStats.filter((s) => s.isQueenWinner).length;

  return (
    <div className="mx-auto max-w-6xl px-3 sm:px-4 py-6 sm:py-8 lg:px-6">
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="glass-card border border-rose-500/30 p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-base font-bold text-white mb-2">Delete Tournament?</h3>
            <p className="text-xs text-slate-300 mb-5 leading-relaxed">
              Are you sure you want to permanently delete "{tournament.name}"?
            </p>
            <div className="flex items-center justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </Button>
              <Button variant="danger" size="sm" onClick={handleDelete}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Top Breadcrumb & Controls */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          All Tournaments
        </Link>

        <button
          onClick={() => setShowDeleteModal(true)}
          className="text-xs text-slate-500 hover:text-rose-400 flex items-center gap-1 transition-colors cursor-pointer"
          title="Delete this tournament"
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Delete Tournament</span>
        </button>
      </div>

      {/* Main Tournament Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <div className="flex flex-wrap items-center gap-2.5 mb-2">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
              {tournament.name}
            </h1>
            <Badge variant={statusConfig.variant}>
              <span className="sm:hidden">{statusConfig.shortLabel}</span>
              <span className="hidden sm:inline">{statusConfig.label}</span>
            </Badge>
          </div>
          <div className="flex items-center gap-4 text-xs sm:text-sm text-slate-400">
            <span className="flex items-center gap-1.5">
              <Users className="h-4 w-4 text-purple-400" />
              {tournament.players.length} {pluralize(tournament.players.length, "player")}
            </span>
            <span className="flex items-center gap-1.5">
              <Swords className="h-4 w-4 text-rose-400" />
              {completedMatches.length} / {matches.length}{" "}
              {pluralize(matches.length, "match", "matches")}
            </span>
          </div>
        </div>

        {/* Dynamic Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {tournament.status === "LEAGUE_COMPLETE" && (
            <Button variant="gold" onClick={handleGenerateKnockout}>
              <Trophy className="h-4 w-4" />
              Start Knockout Bracket
            </Button>
          )}

          {needsFinal && (
            <Button variant="queen" onClick={handleGenerateFinal}>
              <Crown className="h-4 w-4" />
              Generate Grand Final
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4 mb-6 sm:mb-8">
        <div className="glass-card p-3.5 sm:p-5 border border-white/10">
          <div className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
            Matches Done
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white tabular-nums">
            {completedMatches.length}
            <span className="text-sm sm:text-base font-normal text-slate-500">
              /{matches.length}
            </span>
          </div>
        </div>

        <div className="glass-card p-3.5 sm:p-5 border border-amber-500/20 bg-amber-500/[0.04]">
          <div className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-amber-400 mb-1 flex items-center gap-1">
            <Flame className="h-3 w-3" />
            Total Bucks
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-400 tabular-nums">
            {totalBucksScored}
          </div>
        </div>

        <div className="glass-card p-3.5 sm:p-5 border border-purple-500/20 bg-purple-500/[0.04]">
          <div className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-purple-400 mb-1 flex items-center gap-1">
            <Crown className="h-3 w-3" />
            Leader
          </div>
          <div className="text-base sm:text-xl font-bold text-white truncate">
            {rankings[0] ? (
              <span className="text-purple-300 font-extrabold">{rankings[0].player.name}</span>
            ) : (
              <span className="text-slate-500">—</span>
            )}
          </div>
          {rankings[0] && (
            <span className="text-[10px] sm:text-xs text-amber-400 font-semibold">
              {rankings[0].totalBucks} bucks
            </span>
          )}
        </div>

        <div className="glass-card p-3.5 sm:p-5 border border-rose-500/20 bg-rose-500/[0.04]">
          <div className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-rose-400 mb-1 flex items-center gap-1">
            <Crown className="h-3 w-3" />
            Queens Pocketed
          </div>
          <div className="text-2xl sm:text-3xl font-black text-rose-400 tabular-nums">
            {queensCaptured}
          </div>
        </div>
      </div>

      {/* Next Match Banner */}
      {nextMatch && (
        <Link href={`/tournament/${tournament.id}/match/${nextMatch.id}`} className="block mb-6 sm:mb-8 group">
          <div className="glass-card p-4 sm:p-5 border border-purple-500/40 bg-gradient-to-r from-purple-950/30 via-slate-900/40 to-indigo-950/30 glow-violet group-hover:border-purple-400 transition-all">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-purple-500/20 border border-purple-500/40 shrink-0 text-purple-400 group-hover:scale-105 transition-transform">
                  <Zap className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-purple-400">
                    Next Active Match
                  </p>
                  <p className="text-xs sm:text-sm font-semibold text-white truncate">
                    Round {nextMatch.roundNumber} — Tap here to score on the board
                  </p>
                </div>
              </div>

              <Button size="sm" variant="gold" className="shrink-0">
                Score Now
              </Button>
            </div>
          </div>
        </Link>
      )}

      {/* Tournament Completed Banner */}
      {tournament.status === "COMPLETE" && rankings.length > 0 && (
        <div className="glass-card p-6 mb-6 sm:mb-8 border border-amber-400/50 bg-gradient-to-b from-amber-500/20 via-yellow-500/10 to-transparent glow-amber text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-500 text-slate-950 mx-auto mb-3 shadow-lg shadow-amber-500/30">
            <Crown className="h-8 w-8" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white mb-1">
            Tournament Championship Completed!
          </h2>
          <p className="text-sm text-slate-300">
            Champion:{" "}
            <strong className="text-amber-400 text-base font-extrabold">
              {rankings[0]?.player.name}
            </strong>{" "}
            with {rankings[0]?.totalBucks} total bucks!
          </p>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex gap-1.5 mb-6 rounded-2xl bg-white/[0.04] p-1.5 border border-white/10 sm:w-fit">
        {(
          [
            { key: "matches", label: "Matches", icon: Swords },
            { key: "standings", label: "Standings", icon: BarChart3 },
            { key: "bracket", label: "Bracket", icon: GitBranch },
          ] as const
        ).map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "flex flex-1 sm:flex-initial items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold transition-all cursor-pointer",
              tab === t.key
                ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                : "text-slate-400 hover:text-white"
            )}
          >
            <t.icon className="h-4 w-4" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Matches */}
      {tab === "matches" && (
        <div className="space-y-3">
          {matches.length === 0 ? (
            <div className="glass-card p-12 text-center text-slate-500">
              <Swords className="h-8 w-8 mx-auto mb-2 opacity-40" />
              <p>No matches generated yet.</p>
            </div>
          ) : (
            matches.map((match, i) => (
              <MatchCard
                key={match.id}
                match={match}
                players={tournament.players}
                tournamentId={tournament.id}
                matchStats={allStats
                  .filter((s) => s.matchId === match.id)
                  .map((s) => ({
                    playerId: s.playerId,
                    bucks: s.bucks,
                    result: s.result,
                  }))}
                index={i}
              />
            ))
          )}
        </div>
      )}

      {/* Tab 2: Standings */}
      {tab === "standings" && (
        <div className="glass-card p-4 sm:p-6 border border-white/10">
          <StandingsTable rankings={rankings} />
        </div>
      )}

      {/* Tab 3: Bracket */}
      {tab === "bracket" && (
        <div className="glass-card p-4 sm:p-6 border border-white/10">
          <BracketVisual
            bracket={bracket}
            players={tournament.players}
            tournamentId={tournament.id}
            rankings={rankings}
            onStartKnockout={handleGenerateKnockout}
            onGenerateFinal={handleGenerateFinal}
            canStartKnockout={tournament.status === "LEAGUE_COMPLETE"}
          />
        </div>
      )}
    </div>
  );
}
