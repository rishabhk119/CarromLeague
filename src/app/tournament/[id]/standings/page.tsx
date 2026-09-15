"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { getTournament, getRankings } from "@/lib/store";
import type { Tournament, RankedPlayer } from "@/lib/engine/types";
import { StandingsTable } from "@/components/tournament/StandingsTable";
import { ArrowLeft, BarChart3, Trophy } from "lucide-react";
import Link from "next/link";

export default function StandingsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [rankings, setRankings] = useState<RankedPlayer[]>([]);
  const [mounted, setMounted] = useState(false);

  const refresh = useCallback(() => {
    const stored = getTournament(params.id);
    if (!stored) {
      router.push("/");
      return;
    }
    setTournament(stored.tournament);
    setRankings(getRankings(params.id));
  }, [params.id, router]);

  useEffect(() => {
    setMounted(true);
    refresh();
  }, [refresh]);

  if (!mounted || !tournament) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 rounded-lg bg-white/5" />
          <div className="h-64 rounded-2xl bg-white/5" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <Link
        href={`/tournament/${params.id}`}
        className="mb-6 inline-flex items-center gap-1.5 text-xs sm:text-sm text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to {tournament.name} Hub
      </Link>

      <div className="flex items-center gap-3 mb-8">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-500/20 border border-purple-500/30 text-purple-400">
          <BarChart3 className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Full Standings</h1>
          <p className="text-xs sm:text-sm text-slate-400">{tournament.name}</p>
        </div>
      </div>

      <div className="glass-card p-4 sm:p-6 border border-white/10">
        <StandingsTable rankings={rankings} />
      </div>
    </div>
  );
}
