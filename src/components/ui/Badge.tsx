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
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold tracking-wide transition-colors",
        variant === "default" && "bg-slate-100 text-slate-700 border border-slate-200",
        variant === "success" && "bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-xs",
        variant === "warning" && "bg-amber-50 text-amber-800 border border-amber-200 shadow-xs",
        variant === "danger" && "bg-rose-50 text-rose-700 border border-rose-200 shadow-xs",
        variant === "info" && "bg-cyan-50 text-cyan-800 border border-cyan-200 shadow-xs",
        variant === "purple" && "bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-xs",
        variant === "gold" && "bg-amber-100 text-amber-900 border border-amber-300 shadow-xs",
        className
      )}
      {...props}
    />
  );
}
