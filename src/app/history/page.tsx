"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { getAllStoredData, importState, deleteTournament } from "@/lib/store";
import type { StoredTournament } from "@/lib/store";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  History,
  Trophy,
  Crown,
  Calendar,
  Users,
  Search,
  Download,
  Upload,
  ArrowRight,
  Flame,
  Swords,
  Sparkles,
  Trash2,
} from "lucide-react";
import { formatDate, pluralize } from "@/lib/utils";
import Link from "next/link";

interface LifetimePlayerStats {
  id: string;
  name: string;
  avatarColor: string;
  matchesPlayed: number;
  matchesWon: number;
  totalBucks: number;
  queensCaptured: number;
  tournamentsWon: number;
}

export default function HistoryPage() {
  const [data, setData] = useState<Record<string, StoredTournament>>({});
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"ALL" | "COMPLETE" | "ACTIVE">("ALL");
  const [mounted, setMounted] = useState(false);

  const refresh = () => {
    setData(getAllStoredData());
  };

  useEffect(() => {
    setMounted(true);
    refresh();
  }, []);

  if (!mounted) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-10 w-64 rounded-xl bg-slate-100" />
          <div className="h-48 rounded-2xl bg-slate-100" />
        </div>
      </div>
    );
  }

  const tournamentList = Object.values(data).map((d) => d.tournament);

  // Compute lifetime player stats across all tournaments
  const playerStatsMap = new Map<string, LifetimePlayerStats>();

  Object.values(data).forEach(({ tournament, matches: _matches, matchPlayerStats }) => {
    // Register all players
    tournament.players.forEach((p) => {
      if (!playerStatsMap.has(p.name.toLowerCase())) {
        playerStatsMap.set(p.name.toLowerCase(), {
          id: p.id,
          name: p.name,
          avatarColor: p.avatarColor,
          matchesPlayed: 0,
          matchesWon: 0,
          totalBucks: 0,
          queensCaptured: 0,
          tournamentsWon: 0,
        });
      }
    });

    // Tally stats
    matchPlayerStats.forEach((stat) => {
      const player = tournament.players.find((p) => p.id === stat.playerId);
      if (player) {
        const entry = playerStatsMap.get(player.name.toLowerCase());
        if (entry) {
          entry.matchesPlayed += 1;
          if (stat.result === "WIN") entry.matchesWon += 1;
          entry.totalBucks += stat.bucks;
          if (stat.isQueenWinner) entry.queensCaptured += 1;
        }
      }
    });

    // Check if tournament has a winner
    if (tournament.status === "COMPLETE") {
      // Find top scorer
      const playerBucks = new Map<string, number>();
      matchPlayerStats.forEach((s) => {
        playerBucks.set(s.playerId, (playerBucks.get(s.playerId) ?? 0) + s.bucks);
      });
      let topPlayerId = "";
      let maxBucks = -1;
      playerBucks.forEach((bucks, pid) => {
        if (bucks > maxBucks) {
          maxBucks = bucks;
          topPlayerId = pid;
        }
      });
      if (topPlayerId) {
        const winnerPlayer = tournament.players.find((p) => p.id === topPlayerId);
        if (winnerPlayer) {
          const entry = playerStatsMap.get(winnerPlayer.name.toLowerCase());
          if (entry) entry.tournamentsWon += 1;
        }
      }
    }
  });

  const lifetimePlayers = Array.from(playerStatsMap.values()).sort(
    (a, b) => b.totalBucks - a.totalBucks || b.matchesWon - a.matchesWon
  );

  // Filtered tournament list
  const filteredTournaments = tournamentList
    .filter((t) => {
      if (filter === "COMPLETE" && t.status !== "COMPLETE") return false;
      if (filter === "ACTIVE" && t.status === "COMPLETE") return false;
      if (search && !t.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Export JSON backup
  const handleExport = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(data, null, 2)
    )}`;
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", jsonString);
    downloadAnchor.setAttribute("download", `carromleague_backup_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import JSON backup
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        importState(parsed);
        refresh();
        alert("Backup restored successfully!");
      } catch (err: any) {
        alert("Failed to parse JSON file: " + err.message);
      }
    };
    reader.readAsText(file);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}" from history?`)) {
      deleteTournament(id);
      refresh();
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 flex items-center gap-2.5">
            <History className="h-7 w-7 text-indigo-600" />
            Tournament History & Records
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">
            Complete archives of all carrom tournaments, games, and career statistics.
          </p>
        </div>

        {/* Export / Import Controls */}
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4" />
            Backup JSON
          </Button>

          <label className="inline-flex items-center justify-center gap-2 rounded-xl font-bold transition-all duration-200 ease-out cursor-pointer h-8 px-3 text-xs border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-xs">
            <Upload className="h-4 w-4" />
            Restore
            <input type="file" accept=".json" onChange={handleImport} className="hidden" />
          </label>
        </div>
      </div>

      {/* Career Leaderboard */}
      <div className="p-4 sm:p-6 mb-10 rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50/50 via-white to-amber-50/50 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-amber-500" />
            <h2 className="text-base sm:text-lg font-black text-slate-900">
              All-Time Career Leaderboard
            </h2>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            {lifetimePlayers.length} {pluralize(lifetimePlayers.length, "Player")} tracked
          </span>
        </div>

        {lifetimePlayers.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">No player history recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-bold">
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">Player</th>
                  <th className="py-2.5 px-3 text-right">Bucks</th>
                  <th className="py-2.5 px-3 text-right">Win %</th>
                  <th className="py-2.5 px-3 text-right">W - L</th>
                  <th className="py-2.5 px-3 text-right">Queens</th>
                  <th className="py-2.5 px-3 text-right">Titles</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white/60">
                {lifetimePlayers.map((player, idx) => {
                  const winRate =
                    player.matchesPlayed > 0
                      ? Math.round((player.matchesWon / player.matchesPlayed) * 100)
                      : 0;

                  return (
                    <tr
                      key={player.name}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="py-3 px-3 font-mono font-bold text-slate-500">
                        {idx === 0 ? (
                          <Crown className="h-4 w-4 text-amber-500" />
                        ) : (
                          idx + 1
                        )}
                      </td>
                      <td className="py-3 px-3 font-bold text-slate-900 flex items-center gap-2">
                        <div
                          className="h-3 w-3 rounded-full shrink-0"
                          style={{ backgroundColor: player.avatarColor }}
                        />
                        {player.name}
                      </td>
                      <td className="py-3 px-3 text-right font-black text-amber-600 tabular-nums">
                        {player.totalBucks}
                      </td>
                      <td className="py-3 px-3 text-right tabular-nums text-slate-700 font-medium">
                        {winRate}%
                      </td>
                      <td className="py-3 px-3 text-right tabular-nums text-slate-500">
                        {player.matchesWon} - {player.matchesPlayed - player.matchesWon}
                      </td>
                      <td className="py-3 px-3 text-right tabular-nums text-rose-600 font-bold">
                        {player.queensCaptured}
                      </td>
                      <td className="py-3 px-3 text-right tabular-nums font-bold text-amber-600">
                        {player.tournamentsWon > 0 ? (
                          <span className="inline-flex items-center gap-1 text-amber-600 font-black">
                            <Trophy className="h-3.5 w-3.5 text-amber-500" />
                            {player.tournamentsWon}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Tournaments Filter & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search tournaments..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 rounded-xl pl-10 pr-4 bg-white border border-slate-300 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-indigo-600 transition-colors shadow-xs placeholder:text-slate-400"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1 border border-slate-200 w-full sm:w-auto">
          {(["ALL", "COMPLETE", "ACTIVE"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filter === f
                  ? "bg-white text-indigo-700 shadow-xs border border-slate-200"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {f === "ALL" ? "All" : f === "COMPLETE" ? "Completed" : "In Progress"}
            </button>
          ))}
        </div>
      </div>

      {/* Tournament Cards List */}
      <div className="space-y-3">
        {filteredTournaments.length === 0 ? (
          <div className="p-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
            <Swords className="h-8 w-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm font-medium">No tournaments found matching filter.</p>
          </div>
        ) : (
          filteredTournaments.map((t) => {
            const stored = data[t.id];
            const completedCount = stored?.matches.filter((m) => m.status === "COMPLETED").length || 0;
            const totalBucks = stored?.matchPlayerStats.reduce((s, m) => s + m.bucks, 0) || 0;

            return (
              <div
                key={t.id}
                className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-white hover:border-indigo-300 shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-base font-black text-slate-900 truncate hover:text-indigo-600 transition-colors">
                      <Link href={`/tournament/${t.id}`}>{t.name}</Link>
                    </h3>
                    <Badge variant={t.status === "COMPLETE" ? "success" : "warning"}>
                      {t.status === "COMPLETE" ? "Finished" : "Active"}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-medium">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      {formatDate(t.createdAt)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5 text-slate-400" />
                      {t.players.length} Players
                    </span>
                    <span className="flex items-center gap-1">
                      <Swords className="h-3.5 w-3.5 text-slate-400" />
                      {completedCount} / {stored?.matches.length || 0} Matches
                    </span>
                    <span className="flex items-center gap-1 text-amber-700 font-bold">
                      <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                      {totalBucks} Bucks Scored
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Link href={`/tournament/${t.id}`}>
                    <Button size="sm" variant="secondary">
                      View Hub
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>

                  <button
                    onClick={() => handleDelete(t.id, t.name)}
                    className="h-8 w-8 flex items-center justify-center rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Delete tournament"
                    aria-label={`Delete ${t.name}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
