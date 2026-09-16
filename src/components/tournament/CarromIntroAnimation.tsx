"use client";

import { useEffect, useCallback } from "react";
import { motion, useAnimation } from "framer-motion";
import { Crown } from "lucide-react";
import { playCoinClack, playQueenPocket } from "@/lib/audio";

interface CarromIntroAnimationProps {
  /** Called when the strike animation sequence completes */
  onComplete?: () => void;
}

export function CarromIntroAnimation({ onComplete }: CarromIntroAnimationProps) {
  // Controls for striker and coins
  const strikerControls = useAnimation();
  const queenControls = useAnimation();
  const whiteCoin1Controls = useAnimation();
  const whiteCoin2Controls = useAnimation();
  const whiteCoin3Controls = useAnimation();
  const blackCoin1Controls = useAnimation();
  const blackCoin2Controls = useAnimation();
  const blackCoin3Controls = useAnimation();

  // Reset to initial positions
  const resetBoard = useCallback(() => {
    strikerControls.set({ x: -40, y: 110, scale: 1, opacity: 1 });
    queenControls.set({ x: 0, y: 0, scale: 1, opacity: 1, rotate: 0 });
    whiteCoin1Controls.set({ x: 0, y: -16, scale: 1, opacity: 1 });
    whiteCoin2Controls.set({ x: 14, y: 8, scale: 1, opacity: 1 });
    whiteCoin3Controls.set({ x: -14, y: 8, scale: 1, opacity: 1 });
    blackCoin1Controls.set({ x: 14, y: -8, scale: 1, opacity: 1 });
    blackCoin2Controls.set({ x: -14, y: -8, scale: 1, opacity: 1 });
    blackCoin3Controls.set({ x: 0, y: 16, scale: 1, opacity: 1 });
  }, [strikerControls, queenControls, whiteCoin1Controls, whiteCoin2Controls, whiteCoin3Controls, blackCoin1Controls, blackCoin2Controls, blackCoin3Controls]);

  // Play the carrom strike animation sequence
  const playStrike = useCallback(async () => {
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
          playQueenPocket();
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

    // Notify parent that animation is done
    setTimeout(() => {
      onComplete?.();
    }, 1800);
  }, [strikerControls, queenControls, whiteCoin1Controls, whiteCoin2Controls, whiteCoin3Controls, blackCoin1Controls, blackCoin2Controls, blackCoin3Controls, onComplete]);

  useEffect(() => {
    resetBoard();
    // Auto-play once on initial mount after a gentle delay
    const timer = setTimeout(() => {
      playStrike();
    }, 600);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col items-center select-none">
      {/* Outer Championship Wooden Frame */}
      <div
        className="relative w-full max-w-[340px] sm:max-w-[380px] aspect-square rounded-[2.5rem] p-4 sm:p-5 bg-gradient-to-br from-[#4e321e] via-[#3d2514] to-[#2b180a] border-4 border-[#251408] shadow-2xl shadow-amber-950/25"
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
            className="absolute h-7 w-7 rounded-full bg-gradient-to-tr from-rose-600 via-red-600 to-rose-500 border-2 border-rose-200 shadow-md flex items-center justify-center z-20"
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
            className="absolute h-9 w-9 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-rose-400 border-2 border-white shadow-lg flex items-center justify-center z-30"
          >
            <div className="h-4 w-4 rounded-full border border-white/60 flex items-center justify-center">
              <div className="h-1.5 w-1.5 rounded-full bg-white shadow-xs" />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
