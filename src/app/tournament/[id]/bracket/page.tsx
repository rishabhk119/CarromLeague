"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  getTournament,
  getRankings,
  getKnockoutBracket,
  generateKnockout,
  generateFinal,
} from "@/lib/store";
import type { Tournament, RankedPlayer, KnockoutBracket } from "@/lib/engine/types";
import { BracketVisual } from "@/components/tournament/BracketVisual";
import { ArrowLeft, Trophy } from "lucide-react";
import Link from "next/link";

export default function BracketPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [rankings, setRankings] = useState<RankedPlayer[]>([]);
  const [bracket, setBracket] = useState<KnockoutBracket | null>(null);
  const [mounted, setMounted] = useState(false);

  const refresh = useCallback(() => {
    const stored = getTournament(params.id);
    if (!stored) {
      router.push("/");
      return;
    }
    setTournament(stored.tournament);
    setRankings(getRankings(params.id));
    setBracket(getKnockoutBracket(params.id));
  }, [params.id, router]);

  useEffect(() => {
    setMounted(true);
    refresh();
  }, [refresh]);

  if (!mounted || !tournament) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 rounded-lg bg-slate-100" />
          <div className="h-64 rounded-2xl bg-slate-100" />
        </div>
      </div>
    );
  }

  const handleStartKnockout = () => {
    try {
      generateKnockout(params.id);
      refresh();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleGenerateFinal = () => {
    try {
      generateFinal(params.id);
      refresh();
    } catch (e: any) {
      alert(e.message);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <Link
        href={`/tournament/${tournament.id}`}
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to {tournament.name} Hub
      </Link>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 flex items-center gap-2.5">
            <Trophy className="h-7 w-7 text-amber-500" />
            Tournament Bracket
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">
            {tournament.name} — Knockout Elimination
          </p>
        </div>
      </div>

      <BracketVisual
        bracket={bracket}
        players={tournament.players}
        tournamentId={tournament.id}
        rankings={rankings}
        onStartKnockout={handleStartKnockout}
        onGenerateFinal={handleGenerateFinal}
        canStartKnockout={tournament.status === "LEAGUE_COMPLETE"}
      />
    </div>
  );
}
