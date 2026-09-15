"use client";

import { cn } from "@/lib/utils";
import type { RankedPlayer } from "@/lib/engine/types";
import { PlayerBadge } from "./PlayerBadge";
import { Crown, Target, Sparkles } from "lucide-react";

interface StandingsTableProps {
  rankings: RankedPlayer[];
  className?: string;
  compact?: boolean;
}

export function StandingsTable({
  rankings,
  className,
  compact = false,
}: StandingsTableProps) {
  if (rankings.length === 0) {
    return (
      <div className="text-center py-10 text-slate-500">
        <Target className="h-8 w-8 mx-auto mb-2 opacity-40 text-purple-400" />
        <p className="text-sm">No standings calculated yet. Complete match rounds to view live rankings!</p>
      </div>
    );
  }

  return (
    <div className={cn("overflow-x-auto -mx-2 sm:mx-0", className)}>
      <table className="w-full">
        <thead>
          <tr className="border-b border-white/10">
            <th className="text-left py-3 px-2 sm:px-3 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 w-8 sm:w-12">
              #
            </th>
            <th className="text-left py-3 px-2 sm:px-3 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400">
              Player
            </th>
            <th className="text-right py-3 px-2 sm:px-3 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-amber-400">
              Bucks
            </th>
            <th className="text-right py-3 px-1.5 sm:px-3 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-emerald-400">
              W
            </th>
            <th className="text-right py-3 px-1.5 sm:px-3 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-rose-400">
              L
            </th>
            {!compact && (
              <>
                <th className="text-right py-3 px-2 sm:px-3 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 hidden sm:table-cell">
                  GP
                </th>
                <th className="text-right py-3 px-2 sm:px-3 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-purple-400 hidden sm:table-cell">
                  Avg/G
                </th>
              </>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {rankings.map((rp, i) => {
            const isTop4 = rp.rank <= 4;
            const isRank1 = rp.rank === 1;

            return (
              <tr
                key={rp.player.id}
                className={cn(
                  "transition-colors hover:bg-white/[0.04]",
                  isRank1 && "bg-amber-500/[0.08]",
                  i === 3 && "border-b-2 border-dashed border-purple-500/30" // Knockout cutoff indicator
                )}
              >
                <td className="py-3 px-2 sm:px-3">
                  <div className="flex items-center gap-1">
                    {isRank1 ? (
                      <Crown className="h-4 w-4 text-amber-400 animate-pulse" />
                    ) : (
                      <span
                        className={cn(
                          "text-xs sm:text-sm font-bold tabular-nums",
                          isTop4 ? "text-purple-400" : "text-slate-500"
                        )}
                      >
                        {rp.rank}
                      </span>
                    )}
                  </div>
                </td>
                <td className="py-3 px-2 sm:px-3">
                  <div className="flex items-center gap-2">
                    <PlayerBadge player={rp.player} size="sm" />
                    {isTop4 && (
                      <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-purple-500/15 text-purple-300 border border-purple-500/20 hidden md:inline-block">
                        Top 4
                      </span>
                    )}
                  </div>
                </td>
                <td className="py-3 px-2 sm:px-3 text-right">
                  <span className="text-sm sm:text-base font-black tabular-nums text-amber-400">
                    {rp.totalBucks}
                  </span>
                </td>
                <td className="py-3 px-1.5 sm:px-3 text-right">
                  <span className="text-xs sm:text-sm font-semibold tabular-nums text-emerald-400">
                    {rp.wins}
                  </span>
                </td>
                <td className="py-3 px-1.5 sm:px-3 text-right">
                  <span className="text-xs sm:text-sm tabular-nums text-slate-400">
                    {rp.losses}
                  </span>
                </td>
                {!compact && (
                  <>
                    <td className="py-3 px-2 sm:px-3 text-right hidden sm:table-cell">
                      <span className="text-xs sm:text-sm tabular-nums text-slate-300">
                        {rp.gamesPlayed}
                      </span>
                    </td>
                    <td className="py-3 px-2 sm:px-3 text-right hidden sm:table-cell">
                      <span className="text-xs sm:text-sm tabular-nums text-purple-300 font-semibold">
                        {rp.avgBucks.toFixed(1)}
                      </span>
                    </td>
                  </>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>

      {rankings.length >= 4 && (
        <div className="mt-3 text-[11px] text-purple-400/80 flex items-center gap-1.5 px-2">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Top 4 players at the dashed line qualify for the Championship Knockout bracket.</span>
        </div>
      )}
    </div>
  );
}
