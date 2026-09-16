"use client";

import { useState, useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import { Play, RotateCcw, Zap, Sparkles, Crown } from "lucide-react";
import { playCoinClack, playQueenPocket, playVictoryFanfare } from "@/lib/audio";

export function CarromIntroAnimation() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [pocketed, setPocketed] = useState(false);
  const [strikeCount, setStrikeCount] = useState(0);

  // Controls for striker and coins
  const strikerControls = useAnimation();
  const queenControls = useAnimation();
  const whiteCoin1Controls = useAnimation(); // The one that gets pocketed
  const whiteCoin2Controls = useAnimation();
  const whiteCoin3Controls = useAnimation();
  const blackCoin1Controls = useAnimation();
  const blackCoin2Controls = useAnimation();
  const blackCoin3Controls = useAnimation();

  // Reset to initial positions
  const resetBoard = async () => {
    setPocketed(false);
    setIsPlaying(false);

    strikerControls.set({ x: -40, y: 110, scale: 1, opacity: 1 });
    queenControls.set({ x: 0, y: 0, scale: 1, opacity: 1, rotate: 0 });
    whiteCoin1Controls.set({ x: 0, y: -16, scale: 1, opacity: 1 });
    whiteCoin2Controls.set({ x: 14, y: 8, scale: 1, opacity: 1 });
    whiteCoin3Controls.set({ x: -14, y: 8, scale: 1, opacity: 1 });
    blackCoin1Controls.set({ x: 14, y: -8, scale: 1, opacity: 1 });
    blackCoin2Controls.set({ x: -14, y: -8, scale: 1, opacity: 1 });
    blackCoin3Controls.set({ x: 0, y: 16, scale: 1, opacity: 1 });
  };

  // Play the carrom strike animation sequence
  const playStrike = async () => {
    if (isPlaying) return;
    setIsPlaying(true);
    setPocketed(false);

    // 1. Aim: Striker slides into strike position on the baseline
    await strikerControls.start({
      x: 0,
      y: 110,
      transition: { duration: 0.5, ease: "easeInOut" },
    });

    // 2. Wind up pullback
    await strikerControls.start({
      y: 118,
      transition: { duration: 0.2, ease: "easeOut" },
    });

    // 3. THWACK! High-velocity launch towards center
    strikerControls.start({
      x: 6,
      y: -15,
      transition: { duration: 0.22, ease: [0.12, 0.8, 0.32, 1] },
    });

    // Impact timing
    setTimeout(() => {
      playCoinClack();

      // Striker rebounds slightly
      strikerControls.start({
        x: 18,
        y: 25,
        transition: { duration: 0.4, ease: "easeOut" },
      });

      // Queen ricochets to upper left
      queenControls.start({
        x: -52,
        y: -48,
        rotate: 180,
        transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
      });

      // White Coin 1 arcs and drops into top-right pocket!
      whiteCoin1Controls
        .start({
          x: 112,
          y: -112,
          transition: { duration: 0.65, ease: [0.25, 0.8, 0.4, 1] },
        })
        .then(() => {
          // Pocket drop effect (shrinks & fades into corner pocket hole)
          whiteCoin1Controls.start({
            scale: 0.2,
            opacity: 0,
            transition: { duration: 0.2 },
          });
          setPocketed(true);
          playQueenPocket();
          setStrikeCount((c) => c + 1);
        });

      // Other white coins scatter
      whiteCoin2Controls.start({
        x: 60,
        y: 35,
        transition: { duration: 0.55, ease: "easeOut" },
      });
      whiteCoin3Controls.start({
        x: -65,
        y: 42,
        transition: { duration: 0.5, ease: "easeOut" },
      });

      // Black coins scatter to quadrants
      blackCoin1Controls.start({
        x: 75,
        y: -30,
        transition: { duration: 0.6, ease: "easeOut" },
      });
      blackCoin2Controls.start({
        x: -70,
        y: -25,
        transition: { duration: 0.55, ease: "easeOut" },
      });
      blackCoin3Controls.start({
        x: -15,
        y: 75,
        transition: { duration: 0.45, ease: "easeOut" },
      });
    }, 180);

    // Complete sequence after 1.5s
    setTimeout(() => {
      setIsPlaying(false);
    }, 1600);
  };

  useEffect(() => {
    resetBoard();
    // Auto-play once on initial mount after a gentle delay
    const timer = setTimeout(() => {
      playStrike();
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col items-center select-none">
      {/* Outer Championship Wooden Frame */}
      <div
        onClick={!isPlaying ? playStrike : undefined}
        className="relative cursor-pointer group w-full max-w-[340px] sm:max-w-[380px] aspect-square rounded-[2.5rem] p-4 sm:p-5 bg-gradient-to-br from-[#4e321e] via-[#3d2514] to-[#2b180a] border-4 border-[#251408] shadow-2xl shadow-amber-950/25 transition-transform hover:scale-[1.01]"
        title="Tap the board to flick the striker!"
      >
        {/* Brass Frame Corner Reinforcements */}
        <div className="absolute top-2 left-2 h-6 w-6 rounded-tl-xl border-t-2 border-l-2 border-amber-500/50" />
        <div className="absolute top-2 right-2 h-6 w-6 rounded-tr-xl border-t-2 border-r-2 border-amber-500/50" />
        <div className="absolute bottom-2 left-2 h-6 w-6 rounded-bl-xl border-b-2 border-l-2 border-amber-500/50" />
        <div className="absolute bottom-2 right-2 h-6 w-6 rounded-br-xl border-b-2 border-r-2 border-amber-500/50" />

        {/* 4 Corner Pockets with Realistic Nets */}
        <div className="absolute top-3.5 left-3.5 h-9 w-9 rounded-full bg-[#18120c] border border-amber-800/40 shadow-inner flex items-center justify-center z-10">
          <div className="h-5 w-5 rounded-full bg-black shadow-inner border border-neutral-900" />
        </div>
        <div className="absolute top-3.5 right-3.5 h-9 w-9 rounded-full bg-[#18120c] border border-amber-800/40 shadow-inner flex items-center justify-center z-10">
          <div className="h-5 w-5 rounded-full bg-black shadow-inner border border-neutral-900" />
          {pocketed && (
            <motion.div
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: 1.8, opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="absolute inset-0 rounded-full bg-amber-400/40"
            />
          )}
        </div>
        <div className="absolute bottom-3.5 left-3.5 h-9 w-9 rounded-full bg-[#18120c] border border-amber-800/40 shadow-inner flex items-center justify-center z-10">
          <div className="h-5 w-5 rounded-full bg-black shadow-inner border border-neutral-900" />
        </div>
        <div className="absolute bottom-3.5 right-3.5 h-9 w-9 rounded-full bg-[#18120c] border border-amber-800/40 shadow-inner flex items-center justify-center z-10">
          <div className="h-5 w-5 rounded-full bg-black shadow-inner border border-neutral-900" />
        </div>

        {/* Playing Court Surface: Natural Ivory Lacquer with Authentic Markings */}
        <div className="relative w-full h-full rounded-[1.75rem] bg-gradient-to-br from-[#faf6eb] via-[#f5ecd8] to-[#eddcb9] border border-amber-900/15 overflow-hidden flex items-center justify-center shadow-inner">
          {/* Subtle woodgrain overlay */}
          <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:12px_12px] pointer-events-none" />

          {/* SVG Court Markings */}
          <svg
            viewBox="-150 -150 300 300"
            className="absolute inset-0 w-full h-full pointer-events-none stroke-[#8b1e1e] fill-none"
            strokeWidth="1.2"
          >
            {/* Outer Baselines */}
            <rect
              x="-112"
              y="-112"
              width="224"
              height="224"
              rx="4"
              stroke="#8b1e1e"
              strokeWidth="0.8"
              opacity="0.25"
            />

            {/* Baseline 1 (Bottom) with Endpoint Circles */}
            <line x1="-80" y1="110" x2="80" y2="110" stroke="#8b1e1e" strokeWidth="1.5" />
            <circle cx="-80" cy="110" r="8" stroke="#8b1e1e" strokeWidth="1.2" fill="#eddcb9" />
            <circle cx="-80" cy="110" r="3.5" fill="#8b1e1e" />
            <circle cx="80" cy="110" r="8" stroke="#8b1e1e" strokeWidth="1.2" fill="#eddcb9" />
            <circle cx="80" cy="110" r="3.5" fill="#8b1e1e" />

            {/* Baseline 2 (Top) with Endpoint Circles */}
            <line x1="-80" y1="-110" x2="80" y2="-110" stroke="#8b1e1e" strokeWidth="1.5" />
            <circle cx="-80" cy="-110" r="8" stroke="#8b1e1e" strokeWidth="1.2" fill="#eddcb9" />
            <circle cx="-80" cy="-110" r="3.5" fill="#8b1e1e" />
            <circle cx="80" cy="-110" r="8" stroke="#8b1e1e" strokeWidth="1.2" fill="#eddcb9" />
            <circle cx="80" cy="-110" r="3.5" fill="#8b1e1e" />

            {/* Baseline 3 (Left) */}
            <line x1="-110" y1="-80" x2="-110" y2="80" stroke="#8b1e1e" strokeWidth="1.5" />
            <circle cx="-110" cy="-80" r="8" stroke="#8b1e1e" strokeWidth="1.2" fill="#eddcb9" />
            <circle cx="-110" cy="-80" r="3.5" fill="#8b1e1e" />
            <circle cx="-110" cy="80" r="8" stroke="#8b1e1e" strokeWidth="1.2" fill="#eddcb9" />
            <circle cx="-110" cy="80" r="3.5" fill="#8b1e1e" />

            {/* Baseline 4 (Right) */}
            <line x1="110" y1="-80" x2="110" y2="80" stroke="#8b1e1e" strokeWidth="1.5" />
            <circle cx="110" cy="-80" r="8" stroke="#8b1e1e" strokeWidth="1.2" fill="#eddcb9" />
            <circle cx="110" cy="-80" r="3.5" fill="#8b1e1e" />
            <circle cx="110" cy="80" r="8" stroke="#8b1e1e" strokeWidth="1.2" fill="#eddcb9" />
            <circle cx="110" cy="80" r="3.5" fill="#8b1e1e" />

            {/* Diagonal Arrow Guidelines pointing to pockets */}
            <line x1="-35" y1="-35" x2="-95" y2="-95" stroke="#8b1e1e" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />
            <line x1="35" y1="-35" x2="95" y2="-95" stroke="#8b1e1e" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />
            <line x1="-35" y1="35" x2="-95" y2="95" stroke="#8b1e1e" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />
            <line x1="35" y1="35" x2="95" y2="95" stroke="#8b1e1e" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />

            {/* Center Concentric Circles Pattern */}
            <circle cx="0" cy="0" r="36" stroke="#8b1e1e" strokeWidth="1.5" opacity="0.6" />
            <circle cx="0" cy="0" r="28" stroke="#1c1917" strokeWidth="0.8" opacity="0.4" />
            <circle cx="0" cy="0" r="14" stroke="#8b1e1e" strokeWidth="1.2" fill="#f5ecd8" opacity="0.7" />
          </svg>

          {/* Center Queen Piece (Ruby Red with Gold Motif) */}
          <motion.div
            animate={queenControls}
            className="absolute h-7 w-7 rounded-full bg-gradient-to-tr from-rose-600 via-red-600 to-rose-500 border-2 border-rose-200 shadow-md flex items-center justify-center z-20 cursor-pointer"
          >
            <Crown className="h-3.5 w-3.5 text-white drop-shadow-xs" />
          </motion.div>

          {/* White Coins (Ivory Carrom Men) */}
          <motion.div
            animate={whiteCoin1Controls}
            className="absolute h-6 w-6 rounded-full bg-gradient-to-br from-white via-slate-100 to-slate-200 border border-slate-300 shadow-md flex items-center justify-center z-20"
          >
            <div className="h-2 w-2 rounded-full border border-slate-300" />
          </motion.div>
          <motion.div
            animate={whiteCoin2Controls}
            className="absolute h-6 w-6 rounded-full bg-gradient-to-br from-white via-slate-100 to-slate-200 border border-slate-300 shadow-md flex items-center justify-center z-20"
          >
            <div className="h-2 w-2 rounded-full border border-slate-300" />
          </motion.div>
          <motion.div
            animate={whiteCoin3Controls}
            className="absolute h-6 w-6 rounded-full bg-gradient-to-br from-white via-slate-100 to-slate-200 border border-slate-300 shadow-md flex items-center justify-center z-20"
          >
            <div className="h-2 w-2 rounded-full border border-slate-300" />
          </motion.div>

          {/* Black Coins (Ebony Carrom Men) */}
          <motion.div
            animate={blackCoin1Controls}
            className="absolute h-6 w-6 rounded-full bg-gradient-to-br from-slate-700 via-slate-800 to-slate-950 border border-slate-600 shadow-md flex items-center justify-center z-20"
          >
            <div className="h-2 w-2 rounded-full border border-slate-600" />
          </motion.div>
          <motion.div
            animate={blackCoin2Controls}
            className="absolute h-6 w-6 rounded-full bg-gradient-to-br from-slate-700 via-slate-800 to-slate-950 border border-slate-600 shadow-md flex items-center justify-center z-20"
          >
            <div className="h-2 w-2 rounded-full border border-slate-600" />
          </motion.div>
          <motion.div
            animate={blackCoin3Controls}
            className="absolute h-6 w-6 rounded-full bg-gradient-to-br from-slate-700 via-slate-800 to-slate-950 border border-slate-600 shadow-md flex items-center justify-center z-20"
          >
            <div className="h-2 w-2 rounded-full border border-slate-600" />
          </motion.div>

          {/* The Striker (Larger Championship Disc) */}
          <motion.div
            animate={strikerControls}
            className="absolute h-9 w-9 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-rose-400 border-2 border-white shadow-lg flex items-center justify-center z-30 cursor-pointer"
          >
            <div className="h-4 w-4 rounded-full border border-white/60 flex items-center justify-center">
              <div className="h-1.5 w-1.5 rounded-full bg-white shadow-xs" />
            </div>
          </motion.div>

          {/* Dynamic Aim Line Indicator before strike */}
          {!isPlaying && !pocketed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.4, 0.8, 0.4] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="absolute pointer-events-none w-0.5 h-20 bg-gradient-to-t from-indigo-500 to-transparent z-15"
              style={{ transform: "translateY(55px) rotate(0deg)" }}
            />
          )}

          {/* Pocketed Toast Badge */}
          {pocketed && (
            <motion.div
              initial={{ scale: 0.5, y: 10, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 350, damping: 20 }}
              className="absolute top-12 px-3 py-1 rounded-full bg-emerald-600 text-white text-[11px] font-black tracking-wide flex items-center gap-1.5 shadow-lg z-40 border border-emerald-300"
            >
              <Sparkles className="h-3 w-3 text-yellow-300 animate-spin" />
              POCKETED! +1 BUCK
            </motion.div>
          )}
        </div>
      </div>

      {/* Animation Controls Row */}
      <div className="mt-4 flex items-center gap-2.5">
        <button
          type="button"
          onClick={playStrike}
          disabled={isPlaying}
          className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-indigo-700 px-4 py-2 text-xs font-bold text-white shadow-md shadow-indigo-600/20 hover:shadow-indigo-500/40 hover:brightness-105 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
        >
          <Zap className="h-3.5 w-3.5 text-amber-300" />
          {isPlaying ? "Striking..." : "Flick Striker"}
        </button>

        <button
          type="button"
          onClick={resetBoard}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-xs transition-all cursor-pointer"
        >
          <RotateCcw className="h-3.5 w-3.5 text-slate-400" />
          Reset Board
        </button>

        {strikeCount > 0 && (
          <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200">
            {strikeCount} {strikeCount === 1 ? "Pocket" : "Pockets"}
          </span>
        )}
      </div>
    </div>
  );
}
