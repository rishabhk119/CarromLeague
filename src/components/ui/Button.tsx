"use client";

import { cn } from "@/lib/utils";
import { forwardRef, type ButtonHTMLAttributes } from "react";
import { playButtonClick } from "@/lib/audio";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "gold" | "queen";
  size?: "sm" | "md" | "lg";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", disabled, onClick, ...props }, ref) => {
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      playButtonClick();
      onClick?.(e);
    };

    return (
      <button
        ref={ref}
        disabled={disabled}
        onClick={handleClick}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 ease-out cursor-pointer",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#07080e]",
          "disabled:pointer-events-none disabled:opacity-40 disabled:cursor-not-allowed",
          "active:scale-[0.97]",
          // Variants
          variant === "primary" &&
            "bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/30 hover:shadow-purple-500/50 hover:brightness-110 border border-purple-400/30",
          variant === "gold" &&
            "bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-slate-950 font-bold shadow-lg shadow-amber-500/25 hover:shadow-amber-500/45 hover:brightness-105 border border-amber-300/40",
          variant === "queen" &&
            "bg-gradient-to-r from-rose-600 via-pink-600 to-rose-500 text-white shadow-lg shadow-rose-600/30 hover:shadow-rose-500/50 hover:brightness-110 border border-rose-400/40",
          variant === "secondary" &&
            "border border-white/10 bg-[#121626]/80 text-slate-200 hover:bg-[#1a2035] hover:border-purple-500/30 hover:text-white backdrop-blur-sm shadow-sm",
          variant === "ghost" &&
            "text-slate-300 hover:text-white hover:bg-white/[0.07]",
          variant === "danger" &&
            "bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 hover:text-rose-300 hover:border-rose-500/40",
          // Sizes
          size === "sm" && "h-8 px-3 text-xs rounded-lg",
          size === "md" && "h-10 px-5 text-sm",
          size === "lg" && "h-12 px-7 text-base shadow-xl",
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
export { Button };
