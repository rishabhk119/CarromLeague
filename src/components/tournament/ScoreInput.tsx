"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { Player, Match } from "@/lib/engine/types";
import { PlayerBadge } from "./PlayerBadge";
import { Button } from "@/components/ui/Button";
import { Minus, Plus, Crown, Send, RotateCcw, Sparkles } from "lucide-react";
import { playCoinClack, playQueenPocket } from "@/lib/audio";
import { CarromBoardVisual } from "./CarromBoardVisual";
import { QUEEN_BONUS_BUCKS } from "@/lib/engine/constants";

interface ScoreInputProps {
  match: Match;
  players: Player[];
  onSubmit: (
    team1CoinsLeft: number,
    team2CoinsLeft: number,
    queenCoveredBy: string | null
  ) => void;
  isSubmitting?: boolean;
}

export function ScoreInput({
  match,
  players,
  onSubmit,
  isSubmitting = false,
}: ScoreInputProps) {
  const [team1Coins, setTeam1Coins] = useState(0);
  const [team2Coins, setTeam2Coins] = useState(0);
  const [queenCoveredBy, setQueenCoveredBy] = useState<string | null>(null);

  const playerMap = new Map(players.map((p) => [p.id, p]));
  const team1Players = match.team1.playerIds
    .map((id) => playerMap.get(id))
    .filter(Boolean) as Player[];
  const team2Players = match.team2.playerIds
    .map((id) => playerMap.get(id))
    .filter(Boolean) as Player[];
  const allMatchPlayers = [...team1Players, ...team2Players];

  const handleDecreaseT1 = () => {
    playCoinClack();
    setTeam1Coins(Math.max(0, team1Coins - 1));
  };

  const handleIncreaseT1 = () => {
    playCoinClack();
    setTeam1Coins(Math.min(9, team1Coins + 1));
  };

  const handleDecreaseT2 = () => {
    playCoinClack();
    setTeam2Coins(Math.max(0, team2Coins - 1));
  };

  const handleIncreaseT2 = () => {
    playCoinClack();
    setTeam2Coins(Math.min(9, team2Coins + 1));
  };

  const handleToggleQueen = (playerId: string) => {
    if (queenCoveredBy === playerId) {
      setQueenCoveredBy(null);
    } else {
      playQueenPocket();
      setQueenCoveredBy(playerId);
    }
  };

  const handleReset = () => {
    setTeam1Coins(0);
    setTeam2Coins(0);
    setQueenCoveredBy(null);
  };

  // Live bucks preview
  let winner: "team1" | "team2" | "tie" = "tie";
  let team1Bucks = 0;
  let team2Bucks = 0;

  if (team1Coins < team2Coins) {
    winner = "team1";
    team1Bucks = team2Coins;
  } else if (team2Coins < team1Coins) {
    winner = "team2";
    team2Bucks = team1Coins;
  }

  if (queenCoveredBy) {
    const isT1Queen = match.team1.playerIds.includes(queenCoveredBy);
    if (isT1Queen) {
      team1Bucks += QUEEN_BONUS_BUCKS;
    } else {
      team2Bucks += QUEEN_BONUS_BUCKS;
    }
  }

  return (
    <div className="space-y-6">
      {/* Visual Carrom Board */}
      <div className="flex flex-col items-center">
        <CarromBoardVisual
          team1Coins={team1Coins}
          team2Coins={team2Coins}
          queenCoveredBy={queenCoveredBy}
        />
      </div>

      {/* Coin Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Team 1 (White Coins) */}
        <div
          className={cn(
            "glass-card p-4 sm:p-5 border transition-all duration-300",
            winner === "team1"
              ? "border-emerald-500/40 bg-emerald-950/20 shadow-lg shadow-emerald-950/40"
              : "border-white/10"
          )}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-white shadow-sm shadow-white/50 border border-slate-300" />
              <span className="text-sm font-bold text-white">Team 1 (White)</span>
            </div>
            {match.whiteTeamId === match.team1.id && (
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Break
              </span>
            )}
          </div>

          <div className="space-y-1.5 mb-4">
            {team1Players.map((p) => (
              <PlayerBadge key={p.id} player={p} size="sm" />
            ))}
          </div>

          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span>Opponent coins pocketed</span>
              <span className="text-slate-300 font-medium">{team1Coins} left on board</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleDecreaseT1}
                className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-slate-200 transition-colors hover:bg-white/[0.1] active:scale-95 touch-target cursor-pointer"
                aria-label="Decrease team 1 coins"
              >
                <Minus className="h-5 w-5" />
              </button>
              <div className="flex-1 text-center">
                <span className="text-4xl font-extrabold tabular-nums text-white">
                  {team1Coins}
                </span>
                <span className="block text-[10px] uppercase tracking-wider text-slate-500">
                  Coins Left
                </span>
              </div>
              <button
                type="button"
                onClick={handleIncreaseT1}
                className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-slate-200 transition-colors hover:bg-white/[0.1] active:scale-95 touch-target cursor-pointer"
                aria-label="Increase team 1 coins"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Team 2 (Black Coins) */}
        <div
          className={cn(
            "glass-card p-4 sm:p-5 border transition-all duration-300",
            winner === "team2"
              ? "border-emerald-500/40 bg-emerald-950/20 shadow-lg shadow-emerald-950/40"
              : "border-white/10"
          )}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-slate-900 border border-slate-600 shadow-sm" />
              <span className="text-sm font-bold text-white">Team 2 (Black)</span>
            </div>
            {match.whiteTeamId === match.team2.id && (
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Break
              </span>
            )}
          </div>

          <div className="space-y-1.5 mb-4">
            {team2Players.map((p) => (
              <PlayerBadge key={p.id} player={p} size="sm" />
            ))}
          </div>

          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span>Opponent coins pocketed</span>
              <span className="text-slate-300 font-medium">{team2Coins} left on board</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleDecreaseT2}
                className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-slate-200 transition-colors hover:bg-white/[0.1] active:scale-95 touch-target cursor-pointer"
                aria-label="Decrease team 2 coins"
              >
                <Minus className="h-5 w-5" />
              </button>
              <div className="flex-1 text-center">
                <span className="text-4xl font-extrabold tabular-nums text-white">
                  {team2Coins}
                </span>
                <span className="block text-[10px] uppercase tracking-wider text-slate-500">
                  Coins Left
                </span>
              </div>
              <button
                type="button"
                onClick={handleIncreaseT2}
                className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-slate-200 transition-colors hover:bg-white/[0.1] active:scale-95 touch-target cursor-pointer"
                aria-label="Increase team 2 coins"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Queen Selector */}
      <div className="glass-card p-4 sm:p-5 border border-rose-500/20">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-500/20 border border-rose-500/30">
            <Crown className="h-4 w-4 text-rose-400" />
          </div>
          <div>
            <span className="text-sm font-bold text-white">Queen Cover (+3 Bucks)</span>
            <p className="text-[11px] text-slate-400">
              Tap the player who covered and secured the Queen, or leave unselected.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {allMatchPlayers.map((player) => {
            const isSelected = queenCoveredBy === player.id;
            return (
              <button
                key={player.id}
                type="button"
                onClick={() => handleToggleQueen(player.id)}
                className={cn(
                  "flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all cursor-pointer",
                  isSelected
                    ? "border-rose-500 bg-gradient-to-r from-rose-500/25 to-pink-500/20 shadow-lg shadow-rose-950/50"
                    : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]"
                )}
              >
                <div
                  className="h-3 w-3 rounded-full shrink-0"
                  style={{ backgroundColor: player.avatarColor }}
                />
                <span className="text-xs font-semibold text-white truncate flex-1">
                  {player.name}
                </span>
                {isSelected && <Crown className="h-3.5 w-3.5 text-rose-400 shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bucks Summary Preview */}
      <div className="glass-card p-4 border border-purple-500/30 bg-gradient-to-r from-purple-950/20 to-indigo-950/20 flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">
            Projected Bucks Awarded
          </span>
          <div className="flex items-center gap-4 mt-0.5 text-sm font-semibold">
            <span>
              Team 1: <strong className="text-amber-400 text-base">{team1Bucks}</strong> bucks
            </span>
            <span>
              Team 2: <strong className="text-amber-400 text-base">{team2Bucks}</strong> bucks
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleReset} type="button">
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </Button>

          <Button
            variant="gold"
            size="md"
            disabled={isSubmitting}
            onClick={() => onSubmit(team1Coins, team2Coins, queenCoveredBy)}
          >
            <Send className="h-4 w-4" />
            {isSubmitting ? "Submitting..." : "Submit Match Result"}
          </Button>
        </div>
      </div>
    </div>
  );
}
