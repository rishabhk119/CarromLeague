import Link from "next/link";
import { Trophy, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-purple-500/15 border border-purple-500/30 text-purple-400 mx-auto mb-6 shadow-2xl shadow-purple-950/50 animate-float">
        <Trophy className="h-10 w-10 text-purple-400" />
      </div>

      <span className="text-xs font-bold uppercase tracking-widest text-purple-400 mb-2 block">
        404 — Page Not Found
      </span>

      <h1 className="text-2xl sm:text-3xl font-black text-white mb-3">
        Out of the Pocket
      </h1>

      <p className="text-sm text-slate-400 mb-8 leading-relaxed">
        The match or tournament board you are looking for does not exist or has been moved.
      </p>

      <Link
        href="/"
        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-purple-600/30 hover:shadow-purple-500/50 hover:brightness-110 border border-purple-400/30 transition-all cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" />
        Return to Tournaments
      </Link>
    </div>
  );
}
