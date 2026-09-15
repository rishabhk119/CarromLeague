"use client";

import { useState, useEffect } from "react";
import { listTournaments, deleteTournament } from "@/lib/store";
import type { Tournament } from "@/lib/engine/types";
import { TournamentCard } from "@/components/tournament/TournamentCard";
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
          <div className="h-10 w-48 rounded-lg bg-white/5" />
          <div className="h-32 rounded-2xl bg-white/5" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="glass-card border border-rose-500/30 p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-base font-bold text-white mb-2">Delete Tournament?</h3>
            <p className="text-xs text-slate-300 mb-5 leading-relaxed">
              Are you sure you want to delete <strong className="text-white">"{deleteTarget.name}"</strong>? All match records and player bucks for this tournament will be removed.
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
        <div className="flex flex-col items-center justify-center py-16 sm:py-24 text-center">
          {/* Glowing Trophy Badge */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="relative mb-6"
          >
            <div className="absolute -inset-6 rounded-full bg-gradient-to-r from-purple-600/30 via-rose-500/20 to-amber-500/30 blur-2xl animate-pulse" />
            <div className="relative flex h-24 w-24 sm:h-28 sm:w-28 items-center justify-center rounded-3xl bg-gradient-to-br from-violet-600 via-purple-600 to-rose-600 shadow-2xl shadow-purple-600/40 border border-white/20 animate-float">
              <Trophy className="h-12 w-12 sm:h-14 sm:w-14 text-white drop-shadow-md" />
            </div>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-semibold mb-4">
              <Sparkles className="h-3.5 w-3.5" />
              Opinionated 2v2 Carrom Tournament Engine
            </div>

            <h1 className="mb-3 text-3xl sm:text-5xl font-black tracking-tight text-balance">
              <span className="gradient-text">ANTIGRAVITY</span>
            </h1>
            <p className="mb-8 max-w-lg mx-auto text-sm sm:text-base text-slate-400 text-balance leading-relaxed">
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
          <div className="mt-14 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl w-full">
            {[
              {
                icon: Zap,
                title: "Fair Rotation",
                desc: "Equal game counts, balanced partnerships, and bench streaks capped at 2.",
                color: "text-purple-400",
                bg: "from-purple-500/10 to-transparent",
              },
              {
                icon: Target,
                title: "Bucks-Based Ranking",
                desc: "Standard carrom bucks: opponent coins left + 3 for covered Queen.",
                color: "text-amber-400",
                bg: "from-amber-500/10 to-transparent",
              },
              {
                icon: Crown,
                title: "Knockout Bracket",
                desc: "Top 4 advance to cross-seeded 2v2 Semifinals & Grand Final.",
                color: "text-rose-400",
                bg: "from-rose-500/10 to-transparent",
              },
            ].map((feat) => (
              <div
                key={feat.title}
                className="glass-card p-4 border border-white/10 text-left hover:border-purple-500/30 transition-all"
              >
                <div className={`p-2 rounded-xl bg-white/[0.04] w-fit mb-2.5 ${feat.color}`}>
                  <feat.icon className="h-5 w-5" />
                </div>
                <h4 className="text-sm font-bold text-white mb-1">{feat.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* Header with CTA */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                  Active Tournaments
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-purple-500/15 text-purple-300 text-xs font-bold border border-purple-500/25">
                  {tournaments.length}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
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
