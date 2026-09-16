"use client";

import { formatDate, pluralize } from "@/lib/utils";
import type { Tournament } from "@/lib/engine/types";
import { Badge } from "@/components/ui/Badge";
import { PlayerBadge } from "./PlayerBadge";
import { Trophy, Users, Swords, ChevronRight, Trash2 } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

interface TournamentCardProps {
  tournament: Tournament;
  onDelete?: (id: string, name: string) => void;
}

const STATUS_CONFIG: Record<
  string,
  { label: string; variant: "default" | "success" | "warning" | "danger" | "info" | "purple" | "gold" }
> = {
  DRAFT: { label: "Draft", variant: "default" },
  LEAGUE_ACTIVE: { label: "League In Progress", variant: "purple" },
  LEAGUE_COMPLETE: { label: "Ready for Knockout", variant: "warning" },
  KNOCKOUT_ACTIVE: { label: "Knockout Bracket", variant: "warning" },
  COMPLETE: { label: "Championship Done", variant: "gold" },
};

export function TournamentCard({ tournament, onDelete }: TournamentCardProps) {
  const statusConfig = STATUS_CONFIG[tournament.status] ?? STATUS_CONFIG.DRAFT;

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete?.(tournament.id, tournament.name);
  };

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
      className="glass-card glass-card-hover p-5 relative group bg-white border border-slate-200 shadow-xs"
    >
      <Link href={`/tournament/${tournament.id}`} className="block">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3 mb-2.5">
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-xl shrink-0 shadow-xs ${
                  tournament.status === "COMPLETE"
                    ? "bg-amber-50 border border-amber-200 text-amber-700"
                    : "bg-indigo-50 border border-indigo-200 text-indigo-700"
                }`}
              >
                <Trophy className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h3 className="font-extrabold text-slate-900 truncate text-base group-hover:text-indigo-600 transition-colors">
                  {tournament.name}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  {formatDate(tournament.createdAt)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-1.5 text-xs text-slate-700 font-semibold">
                <Users className="h-3.5 w-3.5 text-slate-400" />
                <span>
                  {tournament.players.length}{" "}
                  {pluralize(tournament.players.length, "player")}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-700 font-semibold">
                <Swords className="h-3.5 w-3.5 text-slate-400" />
                <span>
                  {tournament.config.leagueMatches}{" "}
                  {pluralize(tournament.config.leagueMatches, "match", "matches")}
                </span>
              </div>
            </div>

            {/* Player avatars */}
            <div className="flex items-center gap-1 mt-3 -space-x-1.5">
              {tournament.players.slice(0, 6).map((player) => (
                <PlayerBadge
                  key={player.id}
                  player={player}
                  size="sm"
                  showName={false}
                />
              ))}
              {tournament.players.length > 6 && (
                <span className="ml-2 text-xs font-bold text-slate-500">
                  +{tournament.players.length - 6}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col items-end gap-3 shrink-0">
            <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>

            <div className="flex items-center gap-1 mt-auto">
              {onDelete && (
                <button
                  onClick={handleDelete}
                  className="opacity-0 group-hover:opacity-100 h-7 w-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                  title="Delete tournament"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
              <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
