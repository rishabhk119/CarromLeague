"use client";

import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "danger" | "info" | "purple" | "gold";
}

export function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide transition-colors",
        variant === "default" && "bg-white/[0.08] text-slate-300 border border-white/[0.08]",
        variant === "success" && "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-sm shadow-emerald-500/10",
        variant === "warning" && "bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-sm shadow-amber-500/10",
        variant === "danger" && "bg-rose-500/15 text-rose-300 border border-rose-500/30 shadow-sm shadow-rose-500/10",
        variant === "info" && "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm shadow-cyan-500/10",
        variant === "purple" && "bg-purple-500/15 text-purple-300 border border-purple-500/30 shadow-sm shadow-purple-500/10",
        variant === "gold" && "bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-200 border border-amber-400/40 shadow-sm shadow-amber-500/15",
        className
      )}
      {...props}
    />
  );
}
