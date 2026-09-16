"use client";

import type { KnockoutBracket, KnockoutMatch, Player, RankedPlayer } from "@/lib/engine/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Trophy, Crown, Swords, ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

interface BracketVisualProps {
  bracket: KnockoutBracket | null;
  players: Player[];
  tournamentId: string;
  rankings: RankedPlayer[];
  onGenerateFinal?: () => void;
  onStartKnockout?: () => void;
  canStartKnockout?: boolean;
}

export function BracketVisual({
  bracket,
  players,
  tournamentId,
  rankings,
  onGenerateFinal,
  onStartKnockout,
  canStartKnockout,
}: BracketVisualProps) {
  const playerMap = new Map(players.map((p) => [p.id, p]));

  if (!bracket) {
    return (
      <div className="glass-card p-8 sm:p-12 text-center border border-slate-200 bg-white shadow-xs">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600 mx-auto mb-4">
          <Trophy className="h-8 w-8" />
        </div>
        <h3 className="text-lg font-black text-slate-900 mb-2">Knockout Stage Not Started</h3>
        <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
          The top 4 players from the league will advance to the semifinals. Complete all league matches to generate the bracket.
        </p>

        {canStartKnockout && onStartKnockout && (
          <Button variant="gold" size="lg" onClick={onStartKnockout}>
            <Crown className="h-5 w-5" />
            Generate Knockout Bracket
          </Button>
        )}
      </div>
    );
  }

  const renderMatchCard = (
    match: KnockoutMatch | null | undefined,
    title: string,
    roundLabel: string
  ) => {
    if (!match) {
      return (
        <div className="p-4 border border-dashed border-slate-300 bg-slate-50/50 rounded-2xl min-w-[260px] flex flex-col justify-center items-center py-8 text-slate-400">
          <Swords className="h-6 w-6 mb-2 opacity-50 text-slate-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-600">{title}</span>
          <span className="text-[11px] text-slate-400 mt-1">Awaiting Semifinal Results</span>
        </div>
      );
    }

    const t1Players = match.team1.playerIds.map((id) => playerMap.get(id)).filter(Boolean) as Player[];
    const t2Players = match.team2.playerIds.map((id) => playerMap.get(id)).filter(Boolean) as Player[];
    const isCompleted = match.status === "COMPLETED";
    const t1Won = isCompleted && match.winnerTeamId === match.team1.id;
    const t2Won = isCompleted && match.winnerTeamId === match.team2.id;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card p-4 border border-slate-200 hover:border-indigo-300 transition-all rounded-2xl min-w-[260px] sm:min-w-[280px] shadow-xs relative bg-white"
      >
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
            {roundLabel}
          </span>
          {isCompleted ? (
            <Badge variant="success">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Done
            </Badge>
          ) : (
            <Badge variant="warning">Ready</Badge>
          )}
        </div>

        {/* Team 1 */}
        <div
          className={`p-2.5 rounded-xl border mb-2 transition-colors ${
            t1Won
              ? "bg-emerald-50 border-emerald-300 text-emerald-950 font-bold"
              : "bg-slate-50 border-slate-200 text-slate-800"
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex flex-col gap-1 min-w-0">
              {t1Players.map((p) => (
                <div key={p.id} className="flex items-center gap-1.5 truncate">
                  <div
                    className="h-2.5 w-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: p.avatarColor }}
                  />
                  <span className="text-xs font-bold truncate">{p.name}</span>
                </div>
              ))}
            </div>
            {t1Won && <Crown className="h-4 w-4 text-amber-500 shrink-0" />}
          </div>
        </div>

        {/* VS divider */}
        <div className="text-[10px] uppercase font-black text-center text-slate-400 my-1">
          VS
        </div>

        {/* Team 2 */}
        <div
          className={`p-2.5 rounded-xl border mb-3 transition-colors ${
            t2Won
              ? "bg-emerald-50 border-emerald-300 text-emerald-950 font-bold"
              : "bg-slate-50 border-slate-200 text-slate-800"
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex flex-col gap-1 min-w-0">
              {t2Players.map((p) => (
                <div key={p.id} className="flex items-center gap-1.5 truncate">
                  <div
                    className="h-2.5 w-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: p.avatarColor }}
                  />
                  <span className="text-xs font-bold truncate">{p.name}</span>
                </div>
              ))}
            </div>
            {t2Won && <Crown className="h-4 w-4 text-amber-500 shrink-0" />}
          </div>
        </div>

        {/* Link to score or view */}
        <Link href={`/tournament/${tournamentId}/match/${match.id}`}>
          <Button
            size="sm"
            variant={isCompleted ? "secondary" : "primary"}
            className="w-full text-xs font-bold"
          >
            {isCompleted ? "View Scorecard" : "Score Match"}
            <ArrowRight className="h-3 w-3" />
          </Button>
        </Link>
      </motion.div>
    );
  };

  const semisComplete =
    bracket.semifinal1.status === "COMPLETED" && bracket.semifinal2.status === "COMPLETED";
  const finalMatch = bracket.final;
  const isFinalComplete = finalMatch?.status === "COMPLETED";
  const champion = rankings[0];

  return (
    <div className="space-y-6">
      {/* Knockout Banner */}
      <div className="p-4 sm:p-5 border border-indigo-200 bg-gradient-to-r from-indigo-50/60 via-white to-amber-50/60 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div>
          <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            Championship Knockout Bracket
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            Top 4 players cross-seeded into 2v2 Semifinals & Grand Final.
          </p>
        </div>

        {semisComplete && !finalMatch && onGenerateFinal && (
          <Button variant="gold" size="sm" onClick={onGenerateFinal}>
            <Crown className="h-4 w-4" />
            Generate Grand Final
          </Button>
        )}
      </div>

      {/* Bracket Tree Layout */}
      <div className="overflow-x-auto pb-4">
        <div className="min-w-[700px] flex items-center justify-between gap-6 relative px-4 py-6">
          {/* Column 1: Semifinals */}
          <div className="flex flex-col gap-8 flex-1">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 mb-2 block">
                Semifinal 1
              </span>
              {renderMatchCard(bracket.semifinal1, "Semifinal 1", "SF 1")}
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 mb-2 block">
                Semifinal 2
              </span>
              {renderMatchCard(bracket.semifinal2, "Semifinal 2", "SF 2")}
            </div>
          </div>

          {/* Connectors */}
          <div className="w-8 flex flex-col items-center justify-center text-indigo-300">
            <ArrowRight className="h-6 w-6" />
          </div>

          {/* Column 2: Grand Final */}
          <div className="flex flex-col justify-center flex-1">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 mb-2 block text-center">
              Grand Final
            </span>
            {renderMatchCard(finalMatch, "Grand Final", "Final")}
          </div>

          {/* Connector to Trophy */}
          <div className="w-8 flex flex-col items-center justify-center text-amber-400">
            <ArrowRight className="h-6 w-6" />
          </div>

          {/* Column 3: Champion Podium */}
          <div className="flex-1 flex flex-col items-center justify-center">
            <div
              className={`p-6 border text-center max-w-[240px] w-full rounded-2xl transition-all ${
                isFinalComplete
                  ? "border-amber-300 bg-gradient-to-b from-amber-100/70 via-yellow-50 to-white shadow-lg shadow-amber-500/10 glow-amber"
                  : "border-slate-200 bg-slate-50"
              }`}
            >
              <div
                className={`flex h-16 w-16 items-center justify-center rounded-2xl mx-auto mb-3 shadow-md ${
                  isFinalComplete
                    ? "bg-gradient-to-br from-amber-400 to-yellow-500 text-slate-950 animate-bounce"
                    : "bg-slate-200 text-slate-400"
                }`}
              >
                <Crown className="h-9 w-9" />
              </div>

              <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-700 block mb-1">
                Champion
              </span>

              {isFinalComplete && champion ? (
                <div>
                  <h4 className="text-lg font-black text-slate-900 truncate">
                    {champion.player.name}
                  </h4>
                  <p className="text-xs text-amber-700 font-bold mt-1">
                    {champion.totalBucks} Bucks
                  </p>
                </div>
              ) : (
                <p className="text-xs font-medium text-slate-400">To be crowned</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
