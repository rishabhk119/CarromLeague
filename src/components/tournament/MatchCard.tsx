"use client";

import { cn } from "@/lib/utils";
import type { Match, Player } from "@/lib/engine/types";
import { Badge } from "@/components/ui/Badge";
import { PlayerBadge } from "./PlayerBadge";
import { Swords, CheckCircle2, Clock, CircleDot, Crown, ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

interface MatchCardProps {
  match: Match;
  players: Player[];
  tournamentId: string;
  matchStats?: Array<{ playerId: string; bucks: number; result: string }>;
  index: number;
}

export function MatchCard({
  match,
  players,
  tournamentId,
  matchStats,
  index,
}: MatchCardProps) {
  const playerMap = new Map(players.map((p) => [p.id, p]));

  const team1Players = match.team1.playerIds
    .map((id) => playerMap.get(id))
    .filter(Boolean) as Player[];
  const team2Players = match.team2.playerIds
    .map((id) => playerMap.get(id))
    .filter(Boolean) as Player[];

  const isWhiteTeam1 = match.whiteTeamId === match.team1.id;
  const isCompleted = match.status === "COMPLETED";
  const isLive = match.status === "LIVE";

  // Get team bucks if match is completed
  const team1Bucks =
    matchStats
      ?.filter((s) => match.team1.playerIds.includes(s.playerId))
      .reduce((sum, s) => sum + s.bucks, 0) ?? 0;
  const team2Bucks =
    matchStats
      ?.filter((s) => match.team2.playerIds.includes(s.playerId))
      .reduce((sum, s) => sum + s.bucks, 0) ?? 0;

  const team1Won = isCompleted && match.winnerTeamId === match.team1.id;
  const team2Won = isCompleted && match.winnerTeamId === match.team2.id;

  const content = (
    <div
      className={cn(
        "rounded-2xl border p-3.5 sm:p-5 transition-all duration-200 glass-card-hover",
        match.status === "UPCOMING" && "match-upcoming hover:border-purple-500/30",
        match.status === "LIVE" && "match-live",
        match.status === "COMPLETED" && "match-completed"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-[10px] sm:text-xs font-mono font-bold text-purple-400/80 bg-purple-500/10 px-2 py-0.5 rounded-md border border-purple-500/20">
            #{index + 1}
          </span>
          <span className="text-xs font-semibold text-slate-300">
            Round {match.roundNumber}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {isCompleted && (
            <Badge variant="success">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Completed
            </Badge>
          )}
          {isLive && (
            <Badge variant="purple">
              <CircleDot className="h-3 w-3 mr-1 animate-pulse" />
              Live Now
            </Badge>
          )}
          {match.status === "UPCOMING" && (
            <Badge variant="default">
              <Clock className="h-3 w-3 mr-1" />
              Upcoming
            </Badge>
          )}
        </div>
      </div>

      {/* Teams side by side */}
      <div className="flex items-stretch gap-2.5 sm:gap-4">
        {/* Team 1 */}
        <div
          className={cn(
            "flex-1 rounded-xl p-3 border transition-colors min-w-0 flex flex-col justify-between",
            team1Won
              ? "border-emerald-500/40 bg-gradient-to-br from-emerald-950/30 to-slate-900/40 text-emerald-200"
              : "border-white/10 bg-white/[0.02]"
          )}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-white border border-slate-300 shadow-sm" />
              <span className="text-[11px] font-bold text-slate-300">Team 1</span>
              {isWhiteTeam1 && (
                <span className="text-[9px] font-mono uppercase tracking-wider text-amber-400 font-bold ml-1">
                  Break
                </span>
              )}
            </div>
            {isCompleted && (
              <span
                className={cn(
                  "text-lg sm:text-xl font-black tabular-nums",
                  team1Won ? "text-emerald-400" : "text-slate-500"
                )}
              >
                {team1Bucks}
              </span>
            )}
          </div>
          <div className="space-y-1">
            {team1Players.map((p) => (
              <PlayerBadge key={p.id} player={p} size="sm" />
            ))}
          </div>
        </div>

        {/* VS divider */}
        <div className="flex flex-col items-center justify-center gap-1 px-1">
          <div className="h-full w-px bg-white/10 hidden sm:block" />
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/[0.05] border border-white/10 text-slate-400">
            <Swords className="h-3.5 w-3.5" />
          </div>
          <div className="h-full w-px bg-white/10 hidden sm:block" />
        </div>

        {/* Team 2 */}
        <div
          className={cn(
            "flex-1 rounded-xl p-3 border transition-colors min-w-0 flex flex-col justify-between",
            team2Won
              ? "border-emerald-500/40 bg-gradient-to-br from-emerald-950/30 to-slate-900/40 text-emerald-200"
              : "border-white/10 bg-white/[0.02]"
          )}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-slate-900 border border-slate-600 shadow-sm" />
              <span className="text-[11px] font-bold text-slate-300">Team 2</span>
              {!isWhiteTeam1 && (
                <span className="text-[9px] font-mono uppercase tracking-wider text-amber-400 font-bold ml-1">
                  Break
                </span>
              )}
            </div>
            {isCompleted && (
              <span
                className={cn(
                  "text-lg sm:text-xl font-black tabular-nums",
                  team2Won ? "text-emerald-400" : "text-slate-500"
                )}
              >
                {team2Bucks}
              </span>
            )}
          </div>
          <div className="space-y-1">
            {team2Players.map((p) => (
              <PlayerBadge key={p.id} player={p} size="sm" />
            ))}
          </div>
        </div>
      </div>

      {/* Footer / Quick Action */}
      <div className="mt-3 pt-2.5 border-t border-white/[0.06] flex items-center justify-between text-xs text-slate-400">
        <span className="text-[11px]">
          {isCompleted ? "Match Finished" : "Tap to record scores"}
        </span>
        <span className="flex items-center gap-1 text-purple-400 font-semibold group-hover:text-purple-300 transition-colors">
          {isCompleted ? "Edit Score" : "Score Match"}
          <ArrowRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </div>
  );

  return (
    <Link href={`/tournament/${tournamentId}/match/${match.id}`} className="block group">
      {content}
    </Link>
  );
}
