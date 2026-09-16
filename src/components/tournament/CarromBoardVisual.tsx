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
}: CarromBoardVisualProps) {
  // 9 total coins per side
  const team1Pocketed = Math.max(0, 9 - team1Coins);
  const team2Pocketed = Math.max(0, 9 - team2Coins);
  const isQueenPocketed = Boolean(queenCoveredBy);

  return (
    <div className="relative mx-auto w-full max-w-[340px] aspect-square rounded-3xl p-3.5 sm:p-4 bg-gradient-to-br from-[#5c3e29] via-[#432b1a] to-[#301e11] border-4 border-[#3e2718] shadow-xl shadow-amber-950/20 flex flex-col items-center justify-between select-none">
      {/* Corner Pockets */}
      <div className="absolute top-2.5 left-2.5 h-7 w-7 rounded-full bg-[#1c1917] border border-amber-900/60 shadow-inner flex items-center justify-center">
        <div className="h-4 w-4 rounded-full bg-black shadow-inner" />
      </div>
      <div className="absolute top-2.5 right-2.5 h-7 w-7 rounded-full bg-[#1c1917] border border-amber-900/60 shadow-inner flex items-center justify-center">
        <div className="h-4 w-4 rounded-full bg-black shadow-inner" />
      </div>
      <div className="absolute bottom-2.5 left-2.5 h-7 w-7 rounded-full bg-[#1c1917] border border-amber-900/60 shadow-inner flex items-center justify-center">
        <div className="h-4 w-4 rounded-full bg-black shadow-inner" />
      </div>
      <div className="absolute bottom-2.5 right-2.5 h-7 w-7 rounded-full bg-[#1c1917] border border-amber-900/60 shadow-inner flex items-center justify-center">
        <div className="h-4 w-4 rounded-full bg-black shadow-inner" />
      </div>

      {/* Board Playing Surface: Rich Ivory Wood */}
      <div className="relative w-full h-full rounded-2xl bg-gradient-to-br from-[#fcf9ee] via-[#f7f0df] to-[#eedfc4] border border-amber-900/20 flex items-center justify-center overflow-hidden shadow-inner">
        {/* Carrom Baselines Pattern */}
        <div className="absolute inset-5 border border-red-900/15 rounded-lg pointer-events-none" />
        <div className="absolute inset-7 border border-red-900/10 rounded-md pointer-events-none" />

        {/* Center Concentric Circles */}
        <div className="relative flex items-center justify-center h-28 w-28 rounded-full border-2 border-red-800/30 bg-amber-50/40">
          {/* Outer red ring */}
          <div className="absolute inset-2 rounded-full border border-red-700/25" />
          <div className="absolute inset-5 rounded-full border border-slate-900/20" />

          {/* Queen Piece in Center */}
          <motion.div
            animate={{
              scale: isQueenPocketed ? 0.75 : 1,
              opacity: isQueenPocketed ? 0.4 : 1,
              filter: isQueenPocketed ? "grayscale(80%)" : "none",
            }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className={`relative flex items-center justify-center h-11 w-11 rounded-full shadow-md ${
              isQueenPocketed
                ? "bg-slate-300 border border-slate-400"
                : "bg-gradient-to-tr from-rose-600 via-red-500 to-rose-500 border-2 border-rose-200 glow-queen"
            }`}
          >
            <Crown
              className={`h-5 w-5 ${
                isQueenPocketed ? "text-slate-500" : "text-white drop-shadow-md animate-pulse"
              }`}
            />
          </motion.div>
        </div>

        {/* Left Side: Team 1 Pocketed Counter (White Coins) */}
        <div className="absolute left-2.5 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1 bg-white/80 backdrop-blur-xs p-1.5 rounded-xl border border-amber-900/10 shadow-xs">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-700">T1</span>
          <div className="flex flex-col-reverse items-center -space-y-1.5">
            {Array.from({ length: 9 }).map((_, i) => {
              const isPocketed = i < team1Pocketed;
              return (
                <motion.div
                  key={`t1-${i}`}
                  animate={{
                    scale: isPocketed ? 1 : 0.6,
                    opacity: isPocketed ? 1 : 0.2,
                  }}
                  className={`h-3.5 w-3.5 rounded-full border shadow-xs ${
                    isPocketed
                      ? "bg-gradient-to-br from-white via-slate-100 to-slate-200 border-slate-300"
                      : "bg-slate-300 border-slate-400"
                  }`}
                />
              );
            })}
          </div>
          <span className="text-[9px] font-mono font-bold text-slate-800">
            {team1Coins} left
          </span>
        </div>

        {/* Right Side: Team 2 Pocketed Counter (Black Coins) */}
        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1 bg-white/80 backdrop-blur-xs p-1.5 rounded-xl border border-amber-900/10 shadow-xs">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-700">T2</span>
          <div className="flex flex-col-reverse items-center -space-y-1.5">
            {Array.from({ length: 9 }).map((_, i) => {
              const isPocketed = i < team2Pocketed;
              return (
                <motion.div
                  key={`t2-${i}`}
                  animate={{
                    scale: isPocketed ? 1 : 0.6,
                    opacity: isPocketed ? 1 : 0.2,
                  }}
                  className={`h-3.5 w-3.5 rounded-full border shadow-xs ${
                    isPocketed
                      ? "bg-gradient-to-br from-slate-700 via-slate-800 to-slate-950 border-slate-700"
                      : "bg-slate-300 border-slate-400"
                  }`}
                />
              );
            })}
          </div>
          <span className="text-[9px] font-mono font-bold text-slate-800">
            {team2Coins} left
          </span>
        </div>

        {/* Queen Status Pill */}
        {queenCoveredBy && (
          <motion.div
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="absolute bottom-2 px-2.5 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center gap-1 shadow-md"
          >
            <Sparkles className="h-3 w-3 text-rose-200" />
            Queen Captured (+3 Bucks)
          </motion.div>
        )}
      </div>
    </div>
  );
}
