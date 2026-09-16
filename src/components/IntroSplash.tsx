"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CarromIntroAnimation } from "@/components/tournament/CarromIntroAnimation";

const SESSION_KEY = "carromleague_intro_seen";

export function IntroSplash({ children }: { children: React.ReactNode }) {
  const [showSplash, setShowSplash] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Only show splash once per browser session
    const seen = sessionStorage.getItem(SESSION_KEY);
    if (!seen) {
      setShowSplash(true);
    }
  }, []);

  const handleAnimationComplete = () => {
    // Small pause after the strike animation finishes, then fade out
    setTimeout(() => {
      setFadeOut(true);
    }, 600);
  };

  const handleFadeOutComplete = () => {
    sessionStorage.setItem(SESSION_KEY, "1");
    setShowSplash(false);
  };

  // SSR: render children immediately, splash mounts client-side only
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <>
      {children}

      <AnimatePresence>
        {showSplash && (
          <motion.div
            key="intro-splash"
            initial={{ opacity: 1 }}
            animate={{ opacity: fadeOut ? 0 : 1 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            onAnimationComplete={() => {
              if (fadeOut) handleFadeOutComplete();
            }}
            className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white"
          >
            {/* Subtle ambient gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/40 via-white to-amber-50/30 pointer-events-none" />

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center gap-6">
              {/* Carrom Board Animation */}
              <motion.div
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                <CarromIntroAnimation onComplete={handleAnimationComplete} />
              </motion.div>

              {/* Brand Title */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="text-center"
              >
                <h1 className="text-3xl sm:text-5xl font-black tracking-tight">
                  <span className="bg-gradient-to-r from-violet-600 via-indigo-600 to-rose-500 bg-clip-text text-transparent">
                    CARROM LEAGUE
                  </span>
                </h1>
                <p className="mt-2 text-xs sm:text-sm text-slate-500 font-medium tracking-wide">
                  Championship Tournament Arena
                </p>
              </motion.div>

              {/* Loading shimmer bar */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="w-40 h-1 rounded-full bg-slate-200 overflow-hidden"
              >
                <motion.div
                  className="h-full bg-gradient-to-r from-indigo-500 via-violet-500 to-rose-400 rounded-full"
                  initial={{ x: "-100%" }}
                  animate={{ x: "100%" }}
                  transition={{
                    repeat: Infinity,
                    duration: 1.2,
                    ease: "easeInOut",
                  }}
                />
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
