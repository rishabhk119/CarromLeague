"use client";

import { motion } from "framer-motion";
import { Crown, Sparkles } from "lucide-react";

interface CarromBoardVisualProps {
  team1Coins: number;
  team2Coins: number;
  queenCoveredBy: string | null;
  team1Name?: string;
  team2Name?: string;
}

export function CarromBoardVisual({
  team1Coins,
  team2Coins,
  queenCoveredBy,
  team1Name = "Team 1",
  team2Name = "Team 2",
}: CarromBoardVisualProps) {
  // 9 total coins per side
  const team1Pocketed = Math.max(0, 9 - team1Coins);
  const team2Pocketed = Math.max(0, 9 - team2Coins);
  const isQueenPocketed = Boolean(queenCoveredBy);

  return (
    <div className="relative mx-auto w-full max-w-[340px] aspect-square rounded-3xl p-3 sm:p-4 bg-gradient-to-br from-[#2a1d17] via-[#1a1310] to-[#0c0908] border-4 border-[#3d2b22] shadow-2xl shadow-black/80 flex flex-col items-center justify-between select-none">
      {/* Corner Pockets */}
      <div className="absolute top-2.5 left-2.5 h-7 w-7 rounded-full bg-black/90 border border-amber-900/60 shadow-inner flex items-center justify-center">
        <div className="h-4 w-4 rounded-full bg-black shadow-inner" />
      </div>
      <div className="absolute top-2.5 right-2.5 h-7 w-7 rounded-full bg-black/90 border border-amber-900/60 shadow-inner flex items-center justify-center">
        <div className="h-4 w-4 rounded-full bg-black shadow-inner" />
      </div>
      <div className="absolute bottom-2.5 left-2.5 h-7 w-7 rounded-full bg-black/90 border border-amber-900/60 shadow-inner flex items-center justify-center">
        <div className="h-4 w-4 rounded-full bg-black shadow-inner" />
      </div>
      <div className="absolute bottom-2.5 right-2.5 h-7 w-7 rounded-full bg-black/90 border border-amber-900/60 shadow-inner flex items-center justify-center">
        <div className="h-4 w-4 rounded-full bg-black shadow-inner" />
      </div>

      {/* Board Surface */}
      <div className="relative w-full h-full rounded-2xl bg-gradient-to-br from-[#1c1822] via-[#13111b] to-[#0a0910] border border-white/5 flex items-center justify-center overflow-hidden">
        {/* Baselines pattern */}
        <div className="absolute inset-5 border border-amber-500/10 rounded-lg pointer-events-none" />
        <div className="absolute inset-7 border border-amber-500/5 rounded-md pointer-events-none" />

        {/* Center Queen Circle */}
        <div className="relative flex items-center justify-center h-28 w-28 rounded-full border border-amber-500/20 bg-black/30">
          {/* Outer ring */}
          <div className="absolute inset-2 rounded-full border border-purple-500/20" />

          {/* Queen Piece in Center */}
          <motion.div
            animate={{
              scale: isQueenPocketed ? 0.75 : 1,
              opacity: isQueenPocketed ? 0.4 : 1,
              filter: isQueenPocketed ? "grayscale(80%)" : "none",
            }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className={`relative flex items-center justify-center h-11 w-11 rounded-full shadow-lg ${
              isQueenPocketed
                ? "bg-slate-800 border border-slate-700"
                : "bg-gradient-to-tr from-rose-600 via-red-500 to-pink-500 border-2 border-rose-300 glow-queen"
            }`}
          >
            <Crown
              className={`h-5 w-5 ${
                isQueenPocketed ? "text-slate-500" : "text-white drop-shadow-md animate-pulse"
              }`}
            />
          </motion.div>
        </div>

        {/* Left Side: Team 1 Pocketed Counter / Coins Display */}
        <div className="absolute left-2.5 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">T1</span>
          <div className="flex flex-col-reverse items-center -space-y-2">
            {Array.from({ length: 9 }).map((_, i) => {
              const isPocketed = i < team1Pocketed;
              return (
                <motion.div
                  key={`t1-${i}`}
                  animate={{
                    scale: isPocketed ? 1 : 0.6,
                    opacity: isPocketed ? 1 : 0.2,
                  }}
                  className={`h-4 w-4 rounded-full border shadow-sm ${
                    isPocketed
                      ? "bg-gradient-to-br from-white via-slate-200 to-slate-400 border-slate-300 shadow-white/20"
                      : "bg-slate-900 border-slate-800"
                  }`}
                />
              );
            })}
          </div>
          <span className="text-[9px] font-mono font-bold text-slate-300">
            {team1Coins} left
          </span>
        </div>

        {/* Right Side: Team 2 Pocketed Counter / Coins Display */}
        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">T2</span>
          <div className="flex flex-col-reverse items-center -space-y-2">
            {Array.from({ length: 9 }).map((_, i) => {
              const isPocketed = i < team2Pocketed;
              return (
                <motion.div
                  key={`t2-${i}`}
                  animate={{
                    scale: isPocketed ? 1 : 0.6,
                    opacity: isPocketed ? 1 : 0.2,
                  }}
                  className={`h-4 w-4 rounded-full border shadow-sm ${
                    isPocketed
                      ? "bg-gradient-to-br from-slate-700 via-slate-800 to-black border-slate-600 shadow-black/40"
                      : "bg-slate-900 border-slate-800"
                  }`}
                />
              );
            })}
          </div>
          <span className="text-[9px] font-mono font-bold text-slate-300">
            {team2Coins} left
          </span>
        </div>

        {/* Queen Status Pill */}
        {queenCoveredBy && (
          <motion.div
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="absolute bottom-2 px-2.5 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-[10px] font-bold text-rose-300 flex items-center gap-1 shadow-lg shadow-rose-950/50"
          >
            <Sparkles className="h-3 w-3 text-rose-400" />
            Queen Captured (+3 Bucks)
          </motion.div>
        )}
      </div>
    </div>
  );
}
