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
      className="flex items-center justify-center h-8 w-8 rounded-lg border border-slate-200 bg-white text-slate-700 hover:text-slate-900 hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer shadow-xs"
      title={enabled ? "Mute Sound Effects" : "Enable Sound Effects"}
      aria-label="Toggle sound effects"
    >
      {enabled ? (
        <Volume2 className="h-4 w-4 text-indigo-600" />
      ) : (
        <VolumeX className="h-4 w-4 text-slate-400" />
      )}
    </button>
  );
}
