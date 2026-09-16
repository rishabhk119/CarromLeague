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
            className="block text-xs sm:text-sm font-bold text-slate-800 tracking-wide"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "flex h-11 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-900",
            "placeholder:text-slate-400 shadow-xs",
            "transition-all duration-200",
            "focus:border-indigo-600 focus:outline-none focus:ring-3 focus:ring-indigo-500/15 focus:bg-white",
            "disabled:pointer-events-none disabled:opacity-50 disabled:bg-slate-50",
            error && "border-rose-500 focus:border-rose-500 focus:ring-rose-500/20",
            className
          )}
          {...props}
        />
        {hint && !error && (
          <p className="text-[11px] text-slate-500">{hint}</p>
        )}
        {error && (
          <p className="text-xs text-rose-600 font-medium">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
export { Input };
