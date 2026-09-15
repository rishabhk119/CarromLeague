"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createTournament, generateLeague } from "@/lib/store";
import { MIN_PLAYERS, MAX_PLAYERS, LEAGUE_MATCH_COUNTS } from "@/lib/engine/constants";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  ArrowLeft,
  ArrowRight,
  Plus,
  X,
  Trophy,
  Users,
  Zap,
  Check,
  Sparkles,
  Dice5,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { playVictoryFanfare, playButtonClick } from "@/lib/audio";
import { triggerConfetti } from "@/lib/confetti";

type Step = 1 | 2 | 3;

const SAMPLE_NAMES = ["Alex", "Jordan", "Sam", "Chris", "Taylor", "Morgan", "Riley", "Casey"];

export default function NewTournamentPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [name, setName] = useState("");
  const [playerNames, setPlayerNames] = useState<string[]>(["", "", "", "", ""]);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");

  const validPlayers = playerNames.filter((n) => n.trim().length > 0);
  const playerCount = validPlayers.length;
  const leagueMatches = LEAGUE_MATCH_COUNTS[playerCount] ?? 6;

  const canAddMore = playerNames.length < MAX_PLAYERS;
  const hasMinPlayers = playerCount >= MIN_PLAYERS;

  const addPlayer = () => {
    if (canAddMore) {
      setPlayerNames([...playerNames, ""]);
    }
  };

  const removePlayer = (index: number) => {
    if (playerNames.length > MIN_PLAYERS) {
      setPlayerNames(playerNames.filter((_, i) => i !== index));
    }
  };

  const updatePlayer = (index: number, value: string) => {
    const updated = [...playerNames];
    updated[index] = value;
    setPlayerNames(updated);
  };

  const fillSamplePlayers = () => {
    playButtonClick();
    if (!name.trim()) {
      setName("Office Carrom Clash 2025");
    }
    const count = Math.max(playerNames.length, 5);
    const samples = SAMPLE_NAMES.slice(0, count);
    setPlayerNames(samples);
  };

  const handleCreate = async () => {
    setError("");

    if (!name.trim()) {
      setError("Give your tournament a name");
      setStep(1);
      return;
    }

    const trimmed = validPlayers;
    const unique = new Set(trimmed.map((n) => n.toLowerCase()));
    if (unique.size < trimmed.length) {
      setError("Player names must be unique");
      return;
    }

    if (trimmed.length < MIN_PLAYERS) {
      setError(`Need at least ${MIN_PLAYERS} players`);
      return;
    }

    setIsCreating(true);
    try {
      const tournament = createTournament(name, trimmed);
      generateLeague(tournament.id);
      triggerConfetti(2000);
      playVictoryFanfare();
      router.push(`/tournament/${tournament.id}`);
    } catch (e: any) {
      setError(e.message || "Something went wrong");
      setIsCreating(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl px-4 py-8 sm:px-6">
      {/* Back link */}
      <button
        onClick={() => router.push("/")}
        className="mb-8 flex items-center gap-1.5 text-xs sm:text-sm text-slate-400 hover:text-white transition-colors cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to tournaments
      </button>

      {/* Step indicator */}
      <div className="mb-8 flex items-center justify-between">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2 flex-1 last:flex-initial">
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all shrink-0",
                step === s
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-600/40 border border-purple-400"
                  : step > s
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : "bg-white/[0.05] text-slate-500 border border-white/10"
              )}
            >
              {step > s ? <Check className="h-4 w-4" /> : s}
            </div>
            {s < 3 && (
              <div
                className={cn(
                  "h-0.5 flex-1 transition-colors mr-2",
                  step > s ? "bg-emerald-500/40" : "bg-white/10"
                )}
              />
            )}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Step 1: Name */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white mb-2">
                Name your tournament
              </h1>
              <p className="text-xs sm:text-sm text-slate-400">
                Give your championship a memorable title for the standings board.
              </p>
            </div>

            <Input
              label="Tournament Name"
              placeholder="e.g., Diwali Carrom League 2025"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter" && name.trim()) setStep(2);
              }}
            />

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={fillSamplePlayers}
                className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Dice5 className="h-3.5 w-3.5" />
                Quick autofill sample data
              </button>

              <Button
                variant="primary"
                onClick={() => setStep(2)}
                disabled={!name.trim()}
              >
                Next
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 2: Players */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-white mb-1">
                  Add players
                </h1>
                <p className="text-xs sm:text-sm text-slate-400">
                  {MIN_PLAYERS}–{MAX_PLAYERS} players. Unique names required.
                </p>
              </div>

              <button
                type="button"
                onClick={fillSamplePlayers}
                className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Dice5 className="h-3.5 w-3.5" />
                Fill Samples
              </button>
            </div>

            <div className="space-y-2.5">
              {playerNames.map((pn, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-5 text-right text-xs font-mono font-bold text-slate-500 tabular-nums">
                    {i + 1}
                  </span>
                  <Input
                    placeholder={`Player ${i + 1} Name`}
                    value={pn}
                    onChange={(e) => updatePlayer(i, e.target.value)}
                    className="flex-1"
                  />
                  {playerNames.length > MIN_PLAYERS && (
                    <button
                      type="button"
                      onClick={() => removePlayer(i)}
                      className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                      aria-label={`Remove player ${i + 1}`}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {canAddMore && (
              <button
                type="button"
                onClick={addPlayer}
                className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-purple-400 hover:text-purple-300 transition-colors cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                Add another player (Max {MAX_PLAYERS})
              </button>
            )}

            <div className="flex items-center justify-between pt-2">
              <Button variant="ghost" onClick={() => setStep(1)}>
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <Button
                variant="primary"
                onClick={() => setStep(3)}
                disabled={!hasMinPlayers}
              >
                Next ({validPlayers.length} Players)
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Confirm */}
        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white mb-2">
                Confirm & launch
              </h1>
              <p className="text-xs sm:text-sm text-slate-400">
                Review your tournament schedule parameters before kick-off.
              </p>
            </div>

            {error && (
              <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs font-semibold text-rose-400">
                {error}
              </div>
            )}

            <div className="glass-card p-5 sm:p-6 space-y-4 border border-white/15">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500/20 to-purple-500/20 border border-amber-500/30 text-amber-400">
                  <Trophy className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="font-extrabold text-lg text-white">{name}</h2>
                  <p className="text-xs text-purple-400 font-semibold">
                    2v2 Carrom Doubles • 1 Board
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-white/[0.03] border border-white/5 p-3.5">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                    <Users className="h-4 w-4 text-purple-400" />
                    <span>Total Players</span>
                  </div>
                  <p className="text-2xl font-black text-white">{playerCount}</p>
                </div>

                <div className="rounded-xl bg-white/[0.03] border border-white/5 p-3.5">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                    <Zap className="h-4 w-4 text-amber-400" />
                    <span>League Rounds</span>
                  </div>
                  <p className="text-2xl font-black text-amber-400">{leagueMatches}</p>
                </div>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Registered Competitors
                </p>
                <div className="flex flex-wrap gap-2">
                  {validPlayers.map((p, i) => (
                    <span
                      key={i}
                      className="rounded-xl bg-purple-500/15 border border-purple-500/30 px-3 py-1 text-xs font-semibold text-purple-200"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-xl bg-white/[0.02] border border-white/5 p-3.5 text-xs text-slate-400 space-y-1.5 leading-relaxed">
                <p className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-purple-400" />
                  League: {leagueMatches} matches (average ~3 matches per competitor)
                </p>
                <p className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                  Top 4 ranked by bucks advance to cross-seeded Knockouts
                </p>
                <p className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
                  Standard carrom bucks: 1 per opponent coin left + 3 for covered Queen
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <Button variant="ghost" onClick={() => setStep(2)}>
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <Button
                variant="gold"
                size="lg"
                onClick={handleCreate}
                disabled={isCreating}
              >
                <Sparkles className="h-4 w-4" />
                {isCreating ? "Generating Schedule..." : "Launch Tournament"}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
