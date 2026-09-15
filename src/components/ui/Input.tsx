"use client";

import { cn } from "@/lib/utils";
import { forwardRef, type InputHTMLAttributes } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs sm:text-sm font-semibold text-slate-300 tracking-wide"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "flex h-11 w-full rounded-xl border border-white/10 bg-[#0e111d]/90 px-4 text-sm text-slate-50",
            "placeholder:text-slate-500",
            "transition-all duration-200",
            "focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/25 focus:bg-[#131728]",
            "disabled:pointer-events-none disabled:opacity-50",
            error && "border-rose-500 focus:border-rose-500 focus:ring-rose-500/30",
            className
          )}
          {...props}
        />
        {hint && !error && (
          <p className="text-[11px] text-slate-400">{hint}</p>
        )}
        {error && (
          <p className="text-xs text-rose-400 font-medium">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
export { Input };
