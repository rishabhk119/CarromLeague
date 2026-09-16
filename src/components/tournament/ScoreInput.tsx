"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { Player, Match } from "@/lib/engine/types";
import { PlayerBadge } from "./PlayerBadge";
import { Button } from "@/components/ui/Button";
import { Minus, Plus, Crown, Send, RotateCcw } from "lucide-react";
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
            "p-4 sm:p-5 rounded-2xl border transition-all duration-300 bg-white shadow-xs",
            winner === "team1"
              ? "border-emerald-300 bg-emerald-50/50 shadow-md shadow-emerald-500/5"
              : "border-slate-200"
          )}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="h-3.5 w-3.5 rounded-full bg-white shadow-xs border border-slate-300" />
              <span className="text-sm font-black text-slate-900">Team 1 (White)</span>
            </div>
            {match.whiteTeamId === match.team1.id && (
              <span className="text-[10px] font-mono font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
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
            <div className="flex items-center justify-between text-xs text-slate-500 mb-2 font-semibold">
              <span>Remaining coins</span>
              <span className="text-slate-800 font-bold">{team1Coins} on board</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleDecreaseT1}
                className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700 transition-colors hover:bg-slate-100 active:scale-95 touch-target cursor-pointer"
                aria-label="Decrease team 1 coins"
              >
                <Minus className="h-5 w-5" />
              </button>
              <div className="flex-1 text-center">
                <span className="text-4xl font-black tabular-nums text-slate-900">
                  {team1Coins}
                </span>
                <span className="block text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                  Coins Left
                </span>
              </div>
              <button
                type="button"
                onClick={handleIncreaseT1}
                className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700 transition-colors hover:bg-slate-100 active:scale-95 touch-target cursor-pointer"
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
            "p-4 sm:p-5 rounded-2xl border transition-all duration-300 bg-white shadow-xs",
            winner === "team2"
              ? "border-emerald-300 bg-emerald-50/50 shadow-md shadow-emerald-500/5"
              : "border-slate-200"
          )}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="h-3.5 w-3.5 rounded-full bg-slate-900 border border-slate-700 shadow-xs" />
              <span className="text-sm font-black text-slate-900">Team 2 (Black)</span>
            </div>
            {match.whiteTeamId === match.team2.id && (
              <span className="text-[10px] font-mono font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
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
            <div className="flex items-center justify-between text-xs text-slate-500 mb-2 font-semibold">
              <span>Remaining coins</span>
              <span className="text-slate-800 font-bold">{team2Coins} on board</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleDecreaseT2}
                className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700 transition-colors hover:bg-slate-100 active:scale-95 touch-target cursor-pointer"
                aria-label="Decrease team 2 coins"
              >
                <Minus className="h-5 w-5" />
              </button>
              <div className="flex-1 text-center">
                <span className="text-4xl font-black tabular-nums text-slate-900">
                  {team2Coins}
                </span>
                <span className="block text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                  Coins Left
                </span>
              </div>
              <button
                type="button"
                onClick={handleIncreaseT2}
                className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700 transition-colors hover:bg-slate-100 active:scale-95 touch-target cursor-pointer"
                aria-label="Increase team 2 coins"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Queen Selector */}
      <div className="p-4 sm:p-5 rounded-2xl border border-rose-200 bg-rose-50/30">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-100 border border-rose-200">
            <Crown className="h-4 w-4 text-rose-600" />
          </div>
          <div>
            <span className="text-sm font-black text-slate-900">Queen Cover (+3 Bucks)</span>
            <p className="text-[11px] text-slate-500">
              Tap the competitor who covered and secured the Queen, or leave unselected.
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
                  "flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all cursor-pointer shadow-xs",
                  isSelected
                    ? "border-rose-500 bg-rose-100/70 text-rose-900 font-bold shadow-sm"
                    : "border-slate-200 bg-white text-slate-800 hover:bg-slate-50"
                )}
              >
                <div
                  className="h-3 w-3 rounded-full shrink-0"
                  style={{ backgroundColor: player.avatarColor }}
                />
                <span className="text-xs font-bold truncate flex-1">
                  {player.name}
                </span>
                {isSelected && <Crown className="h-3.5 w-3.5 text-rose-600 shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bucks Summary Preview */}
      <div className="p-4 rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-50 via-white to-amber-50 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-700">
            Projected Bucks Awarded
          </span>
          <div className="flex items-center gap-4 mt-0.5 text-sm font-bold text-slate-800">
            <span>
              Team 1: <strong className="text-amber-600 text-base font-black">{team1Bucks}</strong> bucks
            </span>
            <span>
              Team 2: <strong className="text-amber-600 text-base font-black">{team2Bucks}</strong> bucks
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
