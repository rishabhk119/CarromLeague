"use client";

import { cn, getInitials } from "@/lib/utils";
import type { Player } from "@/lib/engine/types";

interface PlayerBadgeProps {
  player: Player;
  size?: "sm" | "md" | "lg";
  showName?: boolean;
  className?: string;
}

export function PlayerBadge({
  player,
  size = "md",
  showName = true,
  className,
}: PlayerBadgeProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div
        className={cn(
          "flex items-center justify-center rounded-full font-black text-slate-950 shrink-0 border border-white/20 shadow-md transition-transform hover:scale-110",
          size === "sm" && "h-6 w-6 text-[9px]",
          size === "md" && "h-8 w-8 text-xs",
          size === "lg" && "h-11 w-11 text-sm shadow-lg"
        )}
        style={{ backgroundColor: player.avatarColor }}
        title={player.name}
      >
        {getInitials(player.name)}
      </div>
      {showName && (
        <span
          className={cn(
            "font-semibold text-slate-100 truncate",
            size === "sm" && "text-xs",
            size === "md" && "text-sm",
            size === "lg" && "text-base font-bold"
          )}
        >
          {player.name}
        </span>
      )}
    </div>
  );
}
