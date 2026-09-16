"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { playCoinClack, playQueenPocket } from "@/lib/audio";

// ─── Constants ─────────────────────────────────
const SESSION_KEY = "carromleague_intro_seen";

// Brand title letters for stagger reveal
const BRAND_LETTERS = "CARROM LEAGUE".split("");

// Coin formation: authentic hex-cluster arrangement (queen center + 6 around it)
// Positions relative to center, scaled for the SVG viewBox
const COIN_FORMATION = [
  // Inner ring (touching queen)
  { id: "w1", type: "white" as const, x: 0, y: -18 },
  { id: "b1", type: "black" as const, x: 15.6, y: -9 },
  { id: "w2", type: "white" as const, x: 15.6, y: 9 },
  { id: "b2", type: "black" as const, x: 0, y: 18 },
  { id: "w3", type: "white" as const, x: -15.6, y: 9 },
  { id: "b3", type: "black" as const, x: -15.6, y: -9 },
  // Outer ring
  { id: "w4", type: "white" as const, x: 0, y: -36 },
  { id: "b4", type: "black" as const, x: 31.2, y: -18 },
  { id: "w5", type: "white" as const, x: 31.2, y: 18 },
  { id: "b5", type: "black" as const, x: 0, y: 36 },
  { id: "w6", type: "white" as const, x: -31.2, y: 18 },
  { id: "b6", type: "black" as const, x: -31.2, y: -18 },
];

// Pre-computed scatter directions (angle in radians, distance)
const SCATTER_TARGETS = [
  { dx: 8, dy: -105, rot: 220 },   // w1 → top, gets pocketed!
  { dx: 85, dy: -50, rot: -180 },  // b1
  { dx: 72, dy: 45, rot: 310 },    // w2
  { dx: -20, dy: 88, rot: 260 },   // b2
  { dx: -80, dy: 40, rot: -290 },  // w3
  { dx: -65, dy: -55, rot: 190 },  // b3
  { dx: 35, dy: -95, rot: 340 },   // w4
  { dx: 98, dy: -15, rot: -150 },  // b4
  { dx: 55, dy: 70, rot: 420 },    // w5
  { dx: -45, dy: 95, rot: -320 },  // b5
  { dx: -90, dy: -10, rot: 380 },  // w6
  { dx: -40, dy: -80, rot: -250 }, // b6
];

// Particle burst on impact
interface Particle {
  id: number;
  x: number;
  y: number;
  angle: number;
  distance: number;
  size: number;
  delay: number;
}

function generateParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: 0,
    y: 0,
    angle: (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.4,
    distance: 30 + Math.random() * 50,
    size: 2 + Math.random() * 3,
    delay: Math.random() * 0.05,
  }));
}

// ─── Main Component ────────────────────────────

export function IntroSplash({ children }: { children: React.ReactNode }) {
  const [showSplash, setShowSplash] = useState(false);
  const [phase, setPhase] = useState<
    "dark" | "reveal" | "board" | "strike" | "scatter" | "title" | "exit"
  >("dark");
  const [mounted, setMounted] = useState(false);
  const [showParticles, setShowParticles] = useState(false);
  const [particles] = useState(() => generateParticles(16));
  const [pocketed, setPocketed] = useState(false);

  // Animation controls for each coin + striker + queen
  const strikerControls = useAnimation();
  const queenControls = useAnimation();
  const coinControls = COIN_FORMATION.map(() => useAnimation());
  const boardGlowControls = useAnimation();
  const spotlightControls = useAnimation();

  const timerRefs = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = useCallback(() => {
    timerRefs.current.forEach(clearTimeout);
    timerRefs.current = [];
  }, []);

  const addTimer = useCallback((fn: () => void, ms: number) => {
    timerRefs.current.push(setTimeout(fn, ms));
  }, []);

  useEffect(() => {
    setMounted(true);
    const seen = sessionStorage.getItem(SESSION_KEY);
    if (!seen) {
      setShowSplash(true);
    }
    return clearTimers;
  }, [clearTimers]);

  // ─── Animation Sequence ────────────────────
  useEffect(() => {
    if (!showSplash) return;

    // Phase 1: Dark → spotlight reveal (0ms)
    setPhase("dark");

    // Phase 2: Spotlight illuminates the board (600ms)
    addTimer(() => {
      setPhase("reveal");
      spotlightControls.start({
        opacity: 1,
        scale: 1,
        transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] },
      });
    }, 400);

    // Phase 3: Board fully visible, coins appear (1200ms)
    addTimer(() => {
      setPhase("board");
      // Set initial coin positions
      COIN_FORMATION.forEach((coin, i) => {
        coinControls[i].set({
          x: coin.x,
          y: coin.y,
          scale: 0,
          opacity: 0,
          rotate: 0,
        });
      });
      // Stagger coin appearance
      COIN_FORMATION.forEach((_, i) => {
        addTimer(() => {
          coinControls[i].start({
            scale: 1,
            opacity: 1,
            transition: {
              type: "spring",
              stiffness: 400,
              damping: 15,
              mass: 0.5,
            },
          });
        }, i * 40);
      });
      // Queen appears last with a glow
      queenControls.set({ x: 0, y: 0, scale: 0, opacity: 0, rotate: 0 });
      addTimer(() => {
        queenControls.start({
          scale: 1,
          opacity: 1,
          transition: { type: "spring", stiffness: 300, damping: 12 },
        });
      }, COIN_FORMATION.length * 40 + 80);
    }, 1400);

    // Phase 4: Striker enters from bottom (2400ms)
    addTimer(() => {
      setPhase("strike");
      strikerControls.set({ x: -50, y: 145, scale: 1, opacity: 0 });
      // Fade in striker
      strikerControls.start({
        opacity: 1,
        transition: { duration: 0.3 },
      });
      // Slide to aim position
      addTimer(async () => {
        await strikerControls.start({
          x: 5,
          y: 135,
          transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] },
        });
        // Dramatic pause...
        addTimer(async () => {
          // Wind-up pullback
          await strikerControls.start({
            y: 142,
            transition: { duration: 0.15, ease: "easeOut" },
          });
          // STRIKE! Explosive forward launch
          strikerControls.start({
            x: 8,
            y: -5,
            transition: { duration: 0.18, ease: [0.1, 0.9, 0.2, 1] },
          });

          // Impact at ~180ms
          addTimer(() => {
            setPhase("scatter");
            playCoinClack();
            setShowParticles(true);

            // Board impact flash
            boardGlowControls.start({
              opacity: [0, 0.6, 0],
              transition: { duration: 0.4, ease: "easeOut" },
            });

            // Striker rebounds
            strikerControls.start({
              x: 25,
              y: 40,
              transition: { duration: 0.5, ease: [0.33, 1, 0.68, 1] },
            });

            // Queen ricochets dramatically
            queenControls.start({
              x: -60,
              y: -55,
              rotate: 360,
              transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
            });

            // Scatter all coins with rotation
            COIN_FORMATION.forEach((_, i) => {
              const target = SCATTER_TARGETS[i];
              const isPocketed = i === 0; // w1 goes to pocket

              coinControls[i].start({
                x: COIN_FORMATION[i].x + target.dx,
                y: COIN_FORMATION[i].y + target.dy,
                rotate: target.rot,
                transition: {
                  duration: isPocketed ? 0.7 : 0.5 + Math.random() * 0.3,
                  ease: [0.16, 1, 0.3, 1],
                  delay: Math.random() * 0.05,
                },
              });

              // Pocket the first white coin
              if (isPocketed) {
                addTimer(() => {
                  coinControls[i].start({
                    scale: 0,
                    opacity: 0,
                    transition: { duration: 0.15, ease: "easeIn" },
                  });
                  setPocketed(true);
                  playQueenPocket();
                }, 650);
              }
            });

            // Hide particles after burst
            addTimer(() => setShowParticles(false), 500);
          }, 180);
        }, 400);
      }, 100);
    }, 2400);

    // Phase 5: Title reveal (4200ms)
    addTimer(() => {
      setPhase("title");
    }, 4000);

    // Phase 6: Exit (5800ms)
    addTimer(() => {
      setPhase("exit");
    }, 5800);

    // Cleanup
    addTimer(() => {
      sessionStorage.setItem(SESSION_KEY, "1");
      setShowSplash(false);
    }, 6600);
  }, [showSplash, addTimer, strikerControls, queenControls, coinControls, boardGlowControls, spotlightControls]);

  if (!mounted) return <>{children}</>;

  return (
    <>
      {children}

      <AnimatePresence>
        {showSplash && (
          <motion.div
            key="intro-splash"
            initial={{ opacity: 1 }}
            animate={{ opacity: phase === "exit" ? 0 : 1 }}
            transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
            className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden"
            style={{
              backgroundColor:
                phase === "dark"
                  ? "#0c0a09"
                  : phase === "reveal"
                  ? "#1a1713"
                  : "#faf8f5",
              transition: "background-color 1.2s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            {/* Ambient radial spotlight (dark phase → illumination) */}
            <motion.div
              animate={spotlightControls}
              initial={{ opacity: 0, scale: 0.5 }}
              className="absolute pointer-events-none"
              style={{
                width: "140vmax",
                height: "140vmax",
                borderRadius: "50%",
                background:
                  "radial-gradient(circle, rgba(250,246,235,0.95) 0%, rgba(250,246,235,0.6) 25%, rgba(250,246,235,0) 60%)",
              }}
            />

            {/* Warm grain texture overlay */}
            <div
              className="absolute inset-0 pointer-events-none opacity-[0.04] mix-blend-multiply"
              style={{
                backgroundImage:
                  "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
              }}
            />

            {/* ─── Board Container ─── */}
            <motion.div
              initial={{ scale: 0.7, opacity: 0, y: 20 }}
              animate={{
                scale: phase === "dark" ? 0.7 : 1,
                opacity: phase === "dark" ? 0 : 1,
                y: phase === "title" || phase === "exit" ? -30 : 0,
              }}
              transition={{
                duration: 1.0,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="relative"
            >
              {/* Carrom Board */}
              <div className="relative w-[320px] h-[320px] sm:w-[380px] sm:h-[380px]">
                {/* Wooden frame with realistic grain */}
                <div
                  className="absolute inset-0 rounded-[2rem]"
                  style={{
                    background:
                      "linear-gradient(135deg, #5a3a1e 0%, #3d2514 40%, #2b180a 100%)",
                    boxShadow:
                      "0 25px 60px -12px rgba(43,24,10,0.5), 0 0 0 3px #1a0e06, inset 0 1px 0 rgba(255,255,255,0.05)",
                  }}
                >
                  {/* Brass corner reinforcements */}
                  {[
                    "top-2 left-2 rounded-tl-2xl border-t-2 border-l-2",
                    "top-2 right-2 rounded-tr-2xl border-t-2 border-r-2",
                    "bottom-2 left-2 rounded-bl-2xl border-b-2 border-l-2",
                    "bottom-2 right-2 rounded-br-2xl border-b-2 border-r-2",
                  ].map((pos) => (
                    <div
                      key={pos}
                      className={`absolute h-7 w-7 ${pos} border-amber-400/40`}
                    />
                  ))}

                  {/* 4 Corner Pockets */}
                  {[
                    "top-3 left-3",
                    "top-3 right-3",
                    "bottom-3 left-3",
                    "bottom-3 right-3",
                  ].map((pos, i) => (
                    <div
                      key={pos}
                      className={`absolute ${pos} h-10 w-10 rounded-full z-10 flex items-center justify-center`}
                      style={{
                        background: "radial-gradient(circle, #000 40%, #18120c 100%)",
                        boxShadow: "inset 0 2px 6px rgba(0,0,0,0.8)",
                        border: "1px solid rgba(139,109,63,0.3)",
                      }}
                    >
                      <div className="h-5 w-5 rounded-full bg-black border border-neutral-800" />
                      {/* Pocket glow when coin drops in */}
                      {pocketed && i === 1 && (
                        <motion.div
                          initial={{ scale: 0.5, opacity: 1 }}
                          animate={{ scale: 2.5, opacity: 0 }}
                          transition={{ duration: 0.6, ease: "easeOut" }}
                          className="absolute inset-0 rounded-full bg-amber-400/30"
                        />
                      )}
                    </div>
                  ))}

                  {/* Playing surface */}
                  <div
                    className="absolute inset-[14px] sm:inset-[18px] rounded-[1.25rem] overflow-hidden flex items-center justify-center"
                    style={{
                      background:
                        "radial-gradient(ellipse at 40% 35%, #faf6eb 0%, #f5ecd8 50%, #eddcb9 100%)",
                      boxShadow:
                        "inset 0 2px 12px rgba(90,58,30,0.15), inset 0 0 0 1px rgba(139,30,30,0.06)",
                    }}
                  >
                    {/* Court markings SVG */}
                    <svg
                      viewBox="-150 -150 300 300"
                      className="absolute inset-0 w-full h-full pointer-events-none"
                    >
                      <defs>
                        <radialGradient id="surfaceSheen" cx="40%" cy="35%">
                          <stop offset="0%" stopColor="#fff" stopOpacity="0.06" />
                          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
                        </radialGradient>
                      </defs>
                      {/* Surface sheen */}
                      <rect x="-150" y="-150" width="300" height="300" fill="url(#surfaceSheen)" />

                      {/* Outer border */}
                      <rect x="-112" y="-112" width="224" height="224" rx="4"
                        stroke="#8b1e1e" strokeWidth="0.8" fill="none" opacity="0.2" />

                      {/* Baselines with endpoint circles */}
                      {[
                        { x1: -80, y1: 110, x2: 80, y2: 110 },
                        { x1: -80, y1: -110, x2: 80, y2: -110 },
                        { x1: -110, y1: -80, x2: -110, y2: 80 },
                        { x1: 110, y1: -80, x2: 110, y2: 80 },
                      ].map((line, i) => (
                        <g key={`baseline-${i}`}>
                          <line {...line} stroke="#8b1e1e" strokeWidth="1.5" opacity="0.5" />
                          <circle cx={line.x1} cy={line.y1} r="7" stroke="#8b1e1e"
                            strokeWidth="1" fill="#eddcb9" opacity="0.6" />
                          <circle cx={line.x1} cy={line.y1} r="3" fill="#8b1e1e" opacity="0.5" />
                          <circle cx={line.x2} cy={line.y2} r="7" stroke="#8b1e1e"
                            strokeWidth="1" fill="#eddcb9" opacity="0.6" />
                          <circle cx={line.x2} cy={line.y2} r="3" fill="#8b1e1e" opacity="0.5" />
                        </g>
                      ))}

                      {/* Diagonal pocket guidelines */}
                      {[
                        { x1: -30, y1: -30, x2: -100, y2: -100 },
                        { x1: 30, y1: -30, x2: 100, y2: -100 },
                        { x1: -30, y1: 30, x2: -100, y2: 100 },
                        { x1: 30, y1: 30, x2: 100, y2: 100 },
                      ].map((line, i) => (
                        <line key={`diag-${i}`} {...line}
                          stroke="#8b1e1e" strokeWidth="0.8" strokeDasharray="4 4" opacity="0.25" />
                      ))}

                      {/* Center circles */}
                      <circle cx="0" cy="0" r="42" stroke="#8b1e1e" strokeWidth="1.5" fill="none" opacity="0.35" />
                      <circle cx="0" cy="0" r="32" stroke="#4a1010" strokeWidth="0.6" fill="none" opacity="0.2" />
                      <circle cx="0" cy="0" r="16" stroke="#8b1e1e" strokeWidth="1" fill="#f5ecd8" opacity="0.5" />
                    </svg>

                    {/* Impact flash glow */}
                    <motion.div
                      animate={boardGlowControls}
                      initial={{ opacity: 0 }}
                      className="absolute inset-0 pointer-events-none rounded-[1.25rem]"
                      style={{
                        background:
                          "radial-gradient(circle at 50% 50%, rgba(255,200,100,0.4) 0%, transparent 60%)",
                      }}
                    />

                    {/* Impact particles */}
                    <AnimatePresence>
                      {showParticles &&
                        particles.map((p) => (
                          <motion.div
                            key={p.id}
                            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                            animate={{
                              x: Math.cos(p.angle) * p.distance,
                              y: Math.sin(p.angle) * p.distance,
                              opacity: 0,
                              scale: 0.3,
                            }}
                            exit={{ opacity: 0 }}
                            transition={{
                              duration: 0.4 + Math.random() * 0.2,
                              ease: "easeOut",
                              delay: p.delay,
                            }}
                            className="absolute z-30 rounded-full"
                            style={{
                              width: p.size,
                              height: p.size,
                              background:
                                p.id % 3 === 0
                                  ? "#d4a44c"
                                  : p.id % 3 === 1
                                  ? "#f5ecd8"
                                  : "#8b6d3f",
                            }}
                          />
                        ))}
                    </AnimatePresence>

                    {/* ─── Coins ─── */}
                    {COIN_FORMATION.map((coin, i) => (
                      <motion.div
                        key={coin.id}
                        animate={coinControls[i]}
                        initial={{ x: coin.x, y: coin.y, scale: 0, opacity: 0, rotate: 0 }}
                        className="absolute z-20 flex items-center justify-center"
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: "50%",
                          background:
                            coin.type === "white"
                              ? "linear-gradient(135deg, #fff 0%, #e8e0d0 50%, #d6ccb8 100%)"
                              : "linear-gradient(135deg, #4a4a4a 0%, #2a2a2a 50%, #1a1a1a 100%)",
                          border:
                            coin.type === "white"
                              ? "1px solid rgba(180,170,150,0.6)"
                              : "1px solid rgba(80,80,80,0.5)",
                          boxShadow:
                            coin.type === "white"
                              ? "0 2px 6px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.5)"
                              : "0 2px 6px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)",
                        }}
                      >
                        <div
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            border: coin.type === "white"
                              ? "1px solid rgba(180,170,150,0.4)"
                              : "1px solid rgba(100,100,100,0.3)",
                          }}
                        />
                      </motion.div>
                    ))}

                    {/* Queen (center, appears after coins) */}
                    <motion.div
                      animate={queenControls}
                      initial={{ x: 0, y: 0, scale: 0, opacity: 0, rotate: 0 }}
                      className="absolute z-25 flex items-center justify-center"
                      style={{
                        width: 26,
                        height: 26,
                        borderRadius: "50%",
                        background:
                          "radial-gradient(circle at 40% 35%, #ef4444 0%, #dc2626 40%, #991b1b 100%)",
                        border: "2px solid rgba(255,200,200,0.5)",
                        boxShadow:
                          "0 3px 10px rgba(220,38,38,0.35), inset 0 1px 2px rgba(255,255,255,0.2)",
                      }}
                    >
                      {/* Crown engraving */}
                      <svg viewBox="0 0 16 16" className="w-3 h-3" fill="rgba(255,255,255,0.85)">
                        <path d="M2 12 L3 5 L5.5 8 L8 4 L10.5 8 L13 5 L14 12 Z" />
                      </svg>
                    </motion.div>

                    {/* Striker */}
                    <motion.div
                      animate={strikerControls}
                      initial={{ x: -50, y: 145, scale: 1, opacity: 0 }}
                      className="absolute z-30 flex items-center justify-center"
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        background:
                          "radial-gradient(circle at 40% 35%, #a78bfa 0%, #7c3aed 50%, #5b21b6 100%)",
                        border: "2.5px solid rgba(255,255,255,0.5)",
                        boxShadow:
                          "0 4px 16px rgba(124,58,237,0.4), inset 0 1px 2px rgba(255,255,255,0.25)",
                      }}
                    >
                      <div
                        style={{
                          width: 14,
                          height: 14,
                          borderRadius: "50%",
                          border: "1.5px solid rgba(255,255,255,0.35)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <div
                          style={{
                            width: 5,
                            height: 5,
                            borderRadius: "50%",
                            background: "rgba(255,255,255,0.7)",
                          }}
                        />
                      </div>
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* ─── Brand Title ─── */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{
                opacity: phase === "title" || phase === "exit" ? 1 : 0,
                y: phase === "title" || phase === "exit" ? 0 : 30,
              }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="mt-8 text-center relative z-10"
            >
              {/* Staggered letter reveal */}
              <h1 className="text-3xl sm:text-5xl font-black tracking-[0.08em] flex justify-center">
                {BRAND_LETTERS.map((letter, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, y: 20, rotateX: 90 }}
                    animate={
                      phase === "title" || phase === "exit"
                        ? { opacity: 1, y: 0, rotateX: 0 }
                        : { opacity: 0, y: 20, rotateX: 90 }
                    }
                    transition={{
                      duration: 0.5,
                      delay: i * 0.04,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className={
                      letter === " "
                        ? "inline-block w-3"
                        : "inline-block bg-gradient-to-b from-slate-800 via-slate-700 to-slate-500 bg-clip-text text-transparent"
                    }
                    style={{ perspective: 200 }}
                  >
                    {letter === " " ? "\u00A0" : letter}
                  </motion.span>
                ))}
              </h1>

              {/* Tagline */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={
                  phase === "title" || phase === "exit"
                    ? { opacity: 1 }
                    : { opacity: 0 }
                }
                transition={{ duration: 0.5, delay: 0.6 }}
                className="mt-3 text-xs sm:text-sm font-medium tracking-[0.2em] uppercase text-slate-400"
              >
                Championship Tournament Arena
              </motion.p>

              {/* Elegant line divider */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={
                  phase === "title" || phase === "exit"
                    ? { scaleX: 1 }
                    : { scaleX: 0 }
                }
                transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="mt-4 mx-auto h-px w-32 bg-gradient-to-r from-transparent via-slate-300 to-transparent"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
