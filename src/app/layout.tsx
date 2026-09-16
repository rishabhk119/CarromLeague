import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { IntroSplash } from "@/components/IntroSplash";
import { AIChatButton } from "@/components/ai/AIChatButton";
import { SoundToggle } from "@/components/ui/SoundToggle";
import Link from "next/link";
import { Plus, Trophy, History } from "lucide-react";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Carrom League — Tournament Arena",
  description:
    "Opinionated 2v2 carrom tournament engine: fair rotation schedule, bucks scoring, and knockout brackets with cloud history.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Carrom League",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} light h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans selection:bg-indigo-500/20 selection:text-indigo-900 bg-white text-slate-900">
        <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl shadow-xs">
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
            {/* Left: Brand Logo & Title */}
            <div className="flex items-center gap-6">
              <Link href="/" className="flex items-center gap-2.5 group">
                <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-rose-500 shadow-md shadow-indigo-600/20 transition-all group-hover:shadow-indigo-500/40 group-hover:scale-105 border border-white/40">
                  {/* Carrom board icon */}
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className="h-5 w-5 text-white"
                    strokeWidth="2.5"
                    stroke="currentColor"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="3" strokeWidth="2" />
                    <circle cx="12" cy="12" r="3" strokeWidth="2" />
                    <circle cx="6" cy="6" r="1.5" fill="currentColor" />
                    <circle cx="18" cy="6" r="1.5" fill="currentColor" />
                    <circle cx="6" cy="18" r="1.5" fill="currentColor" />
                    <circle cx="18" cy="18" r="1.5" fill="currentColor" />
                  </svg>
                </div>
                <div className="flex flex-col">
                  <span className="text-base sm:text-lg font-black tracking-tight gradient-text">
                    CARROM LEAGUE
                  </span>
                  <span className="text-[9px] uppercase tracking-widest text-slate-500 font-bold -mt-1 hidden sm:block">
                    Tournament Arena
                  </span>
                </div>
              </Link>

              {/* Navigation Links */}
              <nav className="hidden md:flex items-center gap-1">
                <Link
                  href="/"
                  className="rounded-lg px-3 py-1.5 text-xs font-bold text-slate-700 transition-colors hover:text-indigo-600 hover:bg-slate-100 flex items-center gap-1.5"
                >
                  <Trophy className="h-3.5 w-3.5 text-indigo-600" />
                  Tournaments
                </Link>
                <Link
                  href="/history"
                  className="rounded-lg px-3 py-1.5 text-xs font-bold text-slate-700 transition-colors hover:text-rose-600 hover:bg-slate-100 flex items-center gap-1.5"
                >
                  <History className="h-3.5 w-3.5 text-rose-500" />
                  History & Records
                </Link>
              </nav>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              <SoundToggle />

              <Link href="/tournament/new" className="hidden sm:block">
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-md shadow-indigo-600/20 hover:shadow-indigo-500/40 hover:brightness-105 border border-indigo-400/30 transition-all cursor-pointer active:scale-95"
                >
                  <Plus className="h-3.5 w-3.5" />
                  New Tournament
                </button>
              </Link>
            </div>
          </div>

          {/* Mobile sub-nav */}
          <div className="flex md:hidden items-center justify-around border-t border-slate-200/80 bg-white/95 px-2 py-1.5">
            <Link
              href="/"
              className="flex items-center gap-1.5 py-1 px-3 text-xs font-bold text-slate-700 hover:text-indigo-600"
            >
              <Trophy className="h-3.5 w-3.5 text-indigo-600" />
              Tournaments
            </Link>
            <Link
              href="/history"
              className="flex items-center gap-1.5 py-1 px-3 text-xs font-bold text-slate-700 hover:text-rose-600"
            >
              <History className="h-3.5 w-3.5 text-rose-500" />
              History
            </Link>
            <Link
              href="/tournament/new"
              className="flex items-center gap-1 py-1 px-2.5 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-200"
            >
              <Plus className="h-3.5 w-3.5" />
              New
            </Link>
          </div>
        </header>

        <main className="flex-1 bg-white">
          <IntroSplash>{children}</IntroSplash>
        </main>

        <footer className="border-t border-slate-200 py-6 pb-safe bg-slate-50">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 font-medium">
            <p className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-indigo-600" />
              Carrom League Engine — Fair Rotation & Bucks Ranking
            </p>
            <div className="flex items-center gap-4">
              <Link href="/history" className="hover:text-slate-900 transition-colors">
                Archives
              </Link>
              <Link href="/tournament/new" className="hover:text-slate-900 transition-colors">
                Start Tournament
              </Link>
            </div>
          </div>
        </footer>

        {/* Floating AI Chat Assistant */}
        <AIChatButton />
      </body>
    </html>
  );
}
