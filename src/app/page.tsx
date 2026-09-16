"use client";

import { useState, useEffect } from "react";
import { listTournaments, deleteTournament } from "@/lib/store";
import type { Tournament } from "@/lib/engine/types";
import { TournamentCard } from "@/components/tournament/TournamentCard";
import { CarromIntroAnimation } from "@/components/tournament/CarromIntroAnimation";
import { Button } from "@/components/ui/Button";
import { Plus, Trophy, Zap, Target, History, Sparkles, Crown } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function DashboardPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [mounted, setMounted] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  const refresh = () => {
    setTournaments(listTournaments());
  };

  useEffect(() => {
    setMounted(true);
    refresh();
  }, []);

  const handleDelete = (id: string, name: string) => {
    setDeleteTarget({ id, name });
  };

  const confirmDelete = () => {
    if (deleteTarget) {
      deleteTournament(deleteTarget.id);
      setDeleteTarget(null);
      refresh();
    }
  };

  if (!mounted) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="animate-pulse space-y-4">
          <div className="h-10 w-48 rounded-lg bg-slate-100" />
          <div className="h-32 rounded-2xl bg-slate-100" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-rose-200 p-6 max-w-sm w-full rounded-2xl shadow-2xl">
            <h3 className="text-base font-black text-slate-900 mb-2">Delete Tournament?</h3>
            <p className="text-xs text-slate-600 mb-5 leading-relaxed font-medium">
              Are you sure you want to delete <strong className="text-slate-900">"{deleteTarget.name}"</strong>? All match records and player bucks for this tournament will be removed.
            </p>
            <div className="flex items-center justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(null)}>
                Cancel
              </Button>
              <Button variant="danger" size="sm" onClick={confirmDelete}>
                Yes, Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Hero section when no tournaments */}
      {tournaments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 sm:py-16 text-center">
          {/* Interactive Carrom Strike Intro Animation */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 18 }}
            className="mb-8"
          >
            <CarromIntroAnimation />
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold mb-4 shadow-xs">
              <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
              Championship 2v2 Carrom Tournament Engine
            </div>

            <h1 className="mb-3 text-4xl sm:text-6xl font-black tracking-tight text-balance">
              <span className="gradient-text">CARROM LEAGUE</span>
            </h1>
            <p className="mb-8 max-w-lg mx-auto text-sm sm:text-base text-slate-600 text-balance leading-relaxed font-medium">
              Fair rotation scheduling, bucks-based individual ranking, and elimination knockout brackets for 4–10 players on a single carrom board.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/tournament/new">
                <Button size="lg" variant="primary" className="w-full sm:w-auto">
                  <Plus className="h-5 w-5" />
                  Launch New Tournament
                </Button>
              </Link>
              <Link href="/history">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                  <History className="h-5 w-5" />
                  View History & Archives
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Feature Pills */}
          <div className="mt-14 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl w-full">
            {[
              {
                icon: Zap,
                title: "Fair Rotation",
                desc: "Equal game counts, balanced partnerships, and bench streaks capped at 2 rounds.",
                color: "text-indigo-600 bg-indigo-50 border-indigo-200",
              },
              {
                icon: Target,
                title: "Bucks-Based Ranking",
                desc: "Standard carrom bucks: opponent coins left on board + 3 for covered Queen.",
                color: "text-amber-600 bg-amber-50 border-amber-200",
              },
              {
                icon: Crown,
                title: "Knockout Bracket",
                desc: "Top 4 advance to cross-seeded 2v2 Semifinals & Championship Grand Final.",
                color: "text-rose-600 bg-rose-50 border-rose-200",
              },
            ].map((feat) => (
              <div
                key={feat.title}
                className="bg-white p-5 rounded-2xl border border-slate-200 text-left shadow-xs hover:border-indigo-300 hover:shadow-md transition-all"
              >
                <div className={`p-2.5 rounded-xl border w-fit mb-3 ${feat.color}`}>
                  <feat.icon className="h-5 w-5" />
                </div>
                <h4 className="text-sm font-extrabold text-slate-900 mb-1">{feat.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* Top Banner with Carrom Animation Teaser */}
          <div className="mb-8 p-6 rounded-3xl bg-gradient-to-r from-indigo-50 via-white to-amber-50 border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="max-w-md">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 text-xs font-bold mb-2">
                <Crown className="h-3.5 w-3.5 text-indigo-700" />
                Live Carrom Arena
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                CARROM LEAGUE
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium leading-relaxed">
                Fair rotation doubles matches, real-time board coin scoring, and elimination brackets.
              </p>
              <div className="mt-4 flex items-center gap-2">
                <Link href="/tournament/new">
                  <Button variant="primary" size="sm">
                    <Plus className="h-4 w-4" />
                    New Tournament
                  </Button>
                </Link>
                <Link href="/history">
                  <Button variant="secondary" size="sm">
                    <History className="h-4 w-4" />
                    Archives
                  </Button>
                </Link>
              </div>
            </div>

            <div className="scale-90 sm:scale-100 shrink-0">
              <CarromIntroAnimation />
            </div>
          </div>

          {/* Header with CTA */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                  Active Tournaments
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-extrabold border border-indigo-200">
                  {tournaments.length}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
                Select a tournament to enter the live hub, score matches, or inspect rankings.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <Link href="/history">
                <Button variant="secondary" size="md">
                  <History className="h-4 w-4" />
                  <span className="hidden sm:inline">Archives</span>
                </Button>
              </Link>

              <Link href="/tournament/new">
                <Button variant="gold" size="md">
                  <Plus className="h-4 w-4" />
                  New Tournament
                </Button>
              </Link>
            </div>
          </div>

          {/* Tournament Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tournaments.map((t) => (
              <TournamentCard key={t.id} tournament={t} onDelete={handleDelete} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
