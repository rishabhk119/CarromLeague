import Link from "next/link";
import { Trophy, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-indigo-50 border border-indigo-200 text-indigo-600 mx-auto mb-6 shadow-md animate-float">
        <Trophy className="h-10 w-10 text-indigo-600" />
      </div>

      <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-600 mb-2 block">
        404 — Page Not Found
      </span>

      <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-3">
        Out of the Pocket
      </h1>

      <p className="text-sm text-slate-600 mb-8 leading-relaxed font-medium">
        The match or tournament board you are looking for does not exist or has been moved.
      </p>

      <Link
        href="/"
        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-indigo-600/20 hover:shadow-indigo-500/40 hover:brightness-105 border border-indigo-400/30 transition-all cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" />
        Return to Tournaments
      </Link>
    </div>
  );
}
