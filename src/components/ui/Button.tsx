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
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
          "disabled:pointer-events-none disabled:opacity-40 disabled:cursor-not-allowed",
          "active:scale-[0.97]",
          // Variants
          variant === "primary" &&
            "bg-gradient-to-r from-violet-600 via-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-600/20 hover:shadow-indigo-500/40 hover:brightness-105 border border-indigo-400/30",
          variant === "gold" &&
            "bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-slate-950 font-bold shadow-md shadow-amber-500/20 hover:shadow-amber-500/35 hover:brightness-105 border border-amber-300/40",
          variant === "queen" &&
            "bg-gradient-to-r from-rose-600 via-pink-600 to-rose-500 text-white shadow-md shadow-rose-600/25 hover:shadow-rose-500/40 hover:brightness-105 border border-rose-400/40",
          variant === "secondary" &&
            "border border-slate-200 bg-white text-slate-800 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-950 shadow-xs",
          variant === "ghost" &&
            "text-slate-600 hover:text-slate-900 hover:bg-slate-100",
          variant === "danger" &&
            "bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 hover:text-rose-800 hover:border-rose-300",
          // Sizes
          size === "sm" && "h-8 px-3 text-xs rounded-lg",
          size === "md" && "h-10 px-5 text-sm",
          size === "lg" && "h-12 px-7 text-base shadow-lg",
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
export { Button };
