"use client";

import { useState, useEffect } from "react";
import { isSoundEnabled, toggleSound } from "@/lib/audio";
import { Volume2, VolumeX } from "lucide-react";

export function SoundToggle() {
  const [enabled, setEnabled] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setEnabled(isSoundEnabled());
  }, []);

  if (!mounted) return null;

  const handleToggle = () => {
    const newState = toggleSound();
    setEnabled(newState);
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      className="flex items-center justify-center h-8 w-8 rounded-lg border border-white/10 bg-white/[0.05] text-slate-300 hover:text-white hover:border-purple-500/30 transition-all cursor-pointer"
      title={enabled ? "Mute Sound Effects" : "Enable Sound Effects"}
      aria-label="Toggle sound effects"
    >
      {enabled ? (
        <Volume2 className="h-4 w-4 text-purple-400" />
      ) : (
        <VolumeX className="h-4 w-4 text-slate-500" />
      )}
    </button>
  );
}
