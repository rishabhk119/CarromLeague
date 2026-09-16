"use client";

import { useState, useEffect } from "react";
import {
  getSupabaseConfig,
  saveSupabaseConfig,
  clearSupabaseConfig,
  testSupabaseConnection,
  pushAllLocalToCloud,
  type SupabaseConfig,
} from "@/lib/supabase";
import { getAllStoredData } from "@/lib/store";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Cloud,
  Database,
  X,
  RefreshCw,
  Copy,
  Check,
  Zap,
  HardDrive,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";

export function SupabaseModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<SupabaseConfig>({
    url: "",
    anonKey: "",
    source: "none",
    isConfigured: false,
  });
  const [urlInput, setUrlInput] = useState("");
  const [keyInput, setKeyInput] = useState("");
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{ success: number; failed: number } | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);

  const loadConfig = () => {
    const current = getSupabaseConfig();
    setConfig(current);
    setUrlInput(current.url);
    setKeyInput(current.anonKey);
  };

  useEffect(() => {
    loadConfig();
  }, []);

  const handleTest = async () => {
    if (!urlInput.trim() || !keyInput.trim()) {
      setTestResult({ ok: false, message: "Please provide both Supabase URL and Anon Key" });
      return;
    }
    saveSupabaseConfig(urlInput, keyInput);
    setTesting(true);
    setTestResult(null);

    const res = await testSupabaseConnection();
    setTesting(false);
    setTestResult(res);
    loadConfig();
  };

  const handleSaveAndSync = async () => {
    if (!urlInput.trim() || !keyInput.trim()) return;
    saveSupabaseConfig(urlInput, keyInput);
    loadConfig();
    setSyncing(true);
    setSyncResult(null);

    const localData = getAllStoredData();
    const res = await pushAllLocalToCloud(localData);
    setSyncing(false);
    setSyncResult(res);
  };

  const handleDisconnect = () => {
    clearSupabaseConfig();
    setUrlInput("");
    setKeyInput("");
    setTestResult(null);
    setSyncResult(null);
    loadConfig();
  };

  const handleCopySql = () => {
    const sql = `-- Run this in Supabase SQL Editor
create extension if not exists "uuid-ossp";

create table if not exists players (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  avatar_color text not null default '#8b5cf6',
  created_at timestamptz not null default now()
);

create table if not exists tournaments (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  status text not null default 'DRAFT',
  config jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists tournament_players (
  id uuid primary key default uuid_generate_v4(),
  tournament_id uuid not null references tournaments(id) on delete cascade,
  player_id uuid not null references players(id) on delete cascade,
  unique(tournament_id, player_id)
);

create table if not exists teams (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz not null default now()
);

create table if not exists team_players (
  id uuid primary key default uuid_generate_v4(),
  team_id uuid not null references teams(id) on delete cascade,
  player_id uuid not null references players(id) on delete cascade
);

create table if not exists matches (
  id uuid primary key default uuid_generate_v4(),
  stage_id uuid not null,
  round_number int not null,
  team1_id uuid not null references teams(id),
  team2_id uuid not null references teams(id),
  status text not null default 'UPCOMING',
  winner_team_id uuid references teams(id),
  white_team_id uuid references teams(id),
  created_at timestamptz not null default now()
);

create table if not exists match_player_stats (
  id uuid primary key default uuid_generate_v4(),
  match_id uuid not null references matches(id) on delete cascade,
  player_id uuid not null references players(id),
  team_id uuid not null references teams(id),
  bucks int not null default 0,
  result text not null,
  is_queen_winner boolean not null default false,
  created_at timestamptz not null default now()
);

alter table players enable row level security;
alter table tournaments enable row level security;
alter table tournament_players enable row level security;
alter table teams enable row level security;
alter table team_players enable row level security;
alter table matches enable row level security;
alter table match_player_stats enable row level security;

create policy if not exists "Allow anon all" on players for all using (true) with check (true);
create policy if not exists "Allow anon all" on tournaments for all using (true) with check (true);
create policy if not exists "Allow anon all" on tournament_players for all using (true) with check (true);
create policy if not exists "Allow anon all" on teams for all using (true) with check (true);
create policy if not exists "Allow anon all" on team_players for all using (true) with check (true);
create policy if not exists "Allow anon all" on matches for all using (true) with check (true);
create policy if not exists "Allow anon all" on match_player_stats for all using (true) with check (true);`;

    navigator.clipboard.writeText(sql);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <>
      {/* Navbar trigger badge */}
      <button
        type="button"
        onClick={() => {
          loadConfig();
          setIsOpen(true);
        }}
        className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold tracking-wide border transition-all cursor-pointer shadow-xs"
        style={{
          backgroundColor: config.isConfigured ? "#ecfdf5" : "#ffffff",
          borderColor: config.isConfigured ? "#a7f3d0" : "#e2e8f0",
          color: config.isConfigured ? "#059669" : "#475569",
        }}
        title="Supabase Cloud Sync Settings"
      >
        {config.isConfigured ? (
          <>
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <Cloud className="h-3.5 w-3.5 text-emerald-600" />
            <span className="hidden sm:inline font-bold">Cloud Synced</span>
          </>
        ) : (
          <>
            <HardDrive className="h-3.5 w-3.5 text-slate-500" />
            <span className="hidden sm:inline font-semibold">Local Store</span>
            <span className="text-[10px] text-indigo-600 underline font-bold ml-1">Connect</span>
          </>
        )}
      </button>

      {/* Modal Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white rounded-2xl border border-slate-200 p-5 sm:p-7 shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Close button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 mb-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600">
                <Database className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  Supabase Cloud Sync
                  {config.isConfigured && (
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Active
                    </span>
                  )}
                </h2>
                <p className="text-xs text-slate-500">
                  Save all carrom matches in cloud history so you can view them anytime from any device.
                </p>
              </div>
            </div>

            {/* Form */}
            <div className="space-y-4 mb-6">
              <Input
                label="Supabase Project URL"
                placeholder="https://xyzcompany.supabase.co"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                hint="Found in your Supabase dashboard under Project Settings > API"
              />

              <Input
                label="Supabase Anon Key"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                type="password"
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                hint="Your public client anon key (safe for browser use)"
              />

              {/* Status Feedback */}
              {testResult && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-start gap-2.5 border ${
                    testResult.ok
                      ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                      : "bg-rose-50 border-rose-200 text-rose-800"
                  }`}
                >
                  {testResult.ok ? (
                    <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5 text-emerald-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-600" />
                  )}
                  <span className="font-medium">{testResult.message}</span>
                </div>
              )}

              {syncResult && (
                <div className="p-3 rounded-xl text-xs bg-indigo-50 border border-indigo-200 text-indigo-800 flex items-center gap-2 font-medium">
                  <Check className="h-4 w-4 text-indigo-600 shrink-0" />
                  <span>
                    Successfully synchronized {syncResult.success} tournament(s) to cloud!
                    {syncResult.failed > 0 && ` (${syncResult.failed} failed)`}
                  </span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <Button
                variant="primary"
                onClick={handleSaveAndSync}
                disabled={testing || syncing || !urlInput || !keyInput}
                className="flex-1"
              >
                {syncing ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4" />
                    Save & Sync All Games
                  </>
                )}
              </Button>

              <Button
                variant="secondary"
                onClick={handleTest}
                disabled={testing || syncing || !urlInput || !keyInput}
              >
                {testing ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Test Connection"}
              </Button>

              {config.isConfigured && (
                <Button variant="danger" size="sm" onClick={handleDisconnect}>
                  Disconnect
                </Button>
              )}
            </div>

            {/* SQL Setup Helper */}
            <div className="border-t border-slate-200 pt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-800">Database Table Setup</span>
                <button
                  onClick={handleCopySql}
                  className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
                >
                  {copiedSql ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                      <span className="text-emerald-600">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      Copy SQL Schema
                    </>
                  )}
                </button>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                If creating a new Supabase project, click <strong>Copy SQL Schema</strong> and run it once in your Supabase SQL Editor.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
