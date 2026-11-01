'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DashboardNavbar } from '../components/navigation/Navbar';
import {
  Shield,
  Zap,
  Lock,
  Ticket,
  Palette,
  TrendingUp,
  Coins,
  Bot,
  ExternalLink,
  ChevronRight,
  Server,
  Sparkles,
  CheckCircle2,
  Terminal,
  Activity,
} from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const [customGuildId, setCustomGuildId] = useState('');

  const handleLaunchDashboard = (e: React.FormEvent) => {
    e.preventDefault();
    const id = customGuildId.trim() || '100000000000000000';
    router.push(`/dashboard/${id}`);
  };

  return (
    <div className="min-h-screen bg-space-950 text-neutral-100 flex flex-col relative overflow-hidden bg-grid-pattern">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-mesh-gradient pointer-events-none opacity-60 blur-3xl" />
      <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] bg-purple-600/10 pointer-events-none rounded-full blur-3xl" />
      <div className="absolute top-[40%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/10 pointer-events-none rounded-full blur-3xl" />

      {/* Navigation */}
      <DashboardNavbar />

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 pt-16 pb-24 text-center z-10 max-w-6xl mx-auto w-full">
        {/* Pill Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-semibold text-indigo-400 shadow-glow-indigo mb-6 animate-pulse-slow">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Next-Generation Sharded Discord Engine • 2026 Ready</span>
        </div>

        {/* Big Headline */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight max-w-4xl leading-[1.1]">
          The Ultimate Mission Control for{' '}
          <span className="gradient-galaxy block mt-2 text-glow">
            Galaxy Bot
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 max-w-2xl text-base sm:text-lg text-neutral-400 leading-relaxed">
          High-performance distributed bot ecosystem built with hybrid sharding. Featuring enterprise Anti-Nuke defense, hardware-accelerated Canvas rank cards, automated support tickets, and multi-tenant guild control.
        </p>

        {/* Creator Attribution */}
        <div className="mt-4 flex items-center justify-center gap-2 text-xs sm:text-sm text-neutral-400">
          <span>Engineered & Architected by</span>
          <a
            href="https://github.com/xSeiff"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 font-semibold text-indigo-400 hover:text-indigo-300 underline underline-offset-4"
          >
            <span>xSeif</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>

        {/* Interactive Server Launcher Card */}
        <div className="mt-10 w-full max-w-xl rounded-2xl border border-white/10 bg-space-900/90 p-6 shadow-2xl backdrop-blur-2xl text-left">
          <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">
            🚀 Launch Guild Mission Control
          </label>
          <form onSubmit={handleLaunchDashboard} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Server className="absolute left-3.5 top-3.5 h-4 w-4 text-neutral-500" />
              <input
                type="text"
                placeholder="Enter Discord Server ID (e.g. 1355035089121316904)"
                value={customGuildId}
                onChange={(e) => setCustomGuildId(e.target.value)}
                className="w-full rounded-xl border border-neutral-800 bg-space-950 pl-10 pr-4 py-3 text-sm text-white placeholder-neutral-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 text-sm font-bold text-white shadow-glow-indigo hover:from-indigo-500 hover:to-purple-500 transition active:scale-95 shrink-0"
            >
              <span>Open Panel</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </form>

          {/* Quick Demo Server links */}
          <div className="mt-4 pt-4 border-t border-white/5 flex flex-wrap items-center gap-2 text-xs text-neutral-400">
            <span className="text-neutral-500">Quick Test Servers:</span>
            <Link
              href="/dashboard/1355035089121316904"
              className="rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-1 text-indigo-300 hover:bg-indigo-500/20 transition"
            >
              Galaxy Bot HQ (Live)
            </Link>
            <Link
              href="/dashboard/100000000000000000"
              className="rounded-lg border border-neutral-800 bg-space-850 px-2.5 py-1 text-neutral-300 hover:bg-space-800 hover:text-white transition"
            >
              Community Guild
            </Link>
          </div>
        </div>

        {/* Live Metrics Grid */}
        <div className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-4xl">
          <div className="rounded-xl border border-white/5 bg-space-900/60 p-4 backdrop-blur">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold mb-1">
              <Activity className="h-4 w-4" />
              <span>Gateway Ping</span>
            </div>
            <p className="text-2xl font-black text-white">15ms</p>
            <span className="text-[11px] text-neutral-400">Zero Gateway Lag</span>
          </div>

          <div className="rounded-xl border border-white/5 bg-space-900/60 p-4 backdrop-blur">
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold mb-1">
              <Shield className="h-4 w-4" />
              <span>Anti-Nuke Intercept</span>
            </div>
            <p className="text-2xl font-black text-white">&lt; 40ms</p>
            <span className="text-[11px] text-neutral-400">Instant Quarantine</span>
          </div>

          <div className="rounded-xl border border-white/5 bg-space-900/60 p-4 backdrop-blur">
            <div className="flex items-center gap-2 text-purple-400 text-xs font-semibold mb-1">
              <Terminal className="h-4 w-4" />
              <span>Slash Commands</span>
            </div>
            <p className="text-2xl font-black text-white">13 Trees</p>
            <span className="text-[11px] text-neutral-400">100% Dual-Context</span>
          </div>

          <div className="rounded-xl border border-white/5 bg-space-900/60 p-4 backdrop-blur">
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold mb-1">
              <Lock className="h-4 w-4" />
              <span>Multi-Tenant</span>
            </div>
            <p className="text-2xl font-black text-white">100% Isolated</p>
            <span className="text-[11px] text-neutral-400">Strict Guild Partition</span>
          </div>
        </div>

        {/* Feature Grid Showcase */}
        <section className="mt-20 w-full text-left">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-extrabold tracking-tight text-white">
              Enterprise Discord Sub-Systems
            </h2>
            <p className="mt-2 text-sm text-neutral-400">
              All signature mechanics unified under Galaxy Bot with full dashboard control.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: Galaxy Guard */}
            <div className="glass-panel glass-panel-hover rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between">
              <div>
                <div className="h-10 w-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mb-4">
                  <Shield className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Galaxy Guard & Anti-Nuke</h3>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Real-time audit log scanner detecting mass channel, role, webhook, and member removals. Strips administrative permissions instantly into a Quarantine hold.
                </p>
                <ul className="mt-4 space-y-1.5 text-xs text-neutral-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-red-400" />
                    <span>Adaptive Heat & Mention Scoring</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-red-400" />
                    <span>1-Click Disaster Recovery Snapshots</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-red-400" />
                    <span>Unauthorized Bot Add Kicker</span>
                  </li>
                </ul>
              </div>
              <Link
                href="/dashboard/100000000000000000/security"
                className="mt-6 inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300"
              >
                <span>Configure Security</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Card 2: Canvas Visuals & Rank Cards */}
            <div className="glass-panel glass-panel-hover rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between">
              <div>
                <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-4">
                  <Palette className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Canvas Visuals & Welcomer</h3>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Hardware-accelerated dynamic Canvas rank cards with customizable backgrounds, progress bars, and level reward ladders.
                </p>
                <ul className="mt-4 space-y-1.5 text-xs text-neutral-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-purple-400" />
                    <span>Customizable Welcomer Studio</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-purple-400" />
                    <span>Voice & Chat XP Multipliers</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-purple-400" />
                    <span>Provably-Fair Casino Mini-Games</span>
                  </li>
                </ul>
              </div>
              <Link
                href="/dashboard/100000000000000000/welcomer"
                className="mt-6 inline-flex items-center gap-1.5 text-xs font-semibold text-purple-400 hover:text-purple-300"
              >
                <span>Studio Editor</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Card 3: Ticket Support Suite */}
            <div className="glass-panel glass-panel-hover rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between">
              <div>
                <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-4">
                  <Ticket className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Ticket Support Desk</h3>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Enterprise modal intake forms, staff ticket claims, custom categories, and dark-mode HTML transcript generator with media previews.
                </p>
                <ul className="mt-4 space-y-1.5 text-xs text-neutral-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-indigo-400" />
                    <span>One-Click Interactive Panels</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-indigo-400" />
                    <span>CSAT Feedback Surveys</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-indigo-400" />
                    <span>Automatic Role Claim Routing</span>
                  </li>
                </ul>
              </div>
              <Link
                href="/dashboard/100000000000000000/tickets"
                className="mt-6 inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300"
              >
                <span>Manage Tickets</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </section>

        {/* Discord Preview Mock */}
        <section className="mt-20 w-full max-w-4xl text-left">
          <div className="rounded-2xl border border-white/10 bg-[#313338] p-6 shadow-2xl">
            <div className="flex items-center gap-2 pb-4 mb-4 border-b border-white/10">
              <div className="h-3 w-3 rounded-full bg-red-500/80" />
              <div className="h-3 w-3 rounded-full bg-amber-500/80" />
              <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
              <span className="ml-2 text-xs font-mono text-neutral-400">#galaxy-command-center</span>
            </div>

            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white shrink-0">
                GB
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white text-sm">Galaxy Bot</span>
                  <span className="rounded bg-[#5865F2] px-1.5 py-0.2 text-[10px] font-bold text-white uppercase">
                    BOT
                  </span>
                  <span className="text-xs text-neutral-400">Today at 1:00 AM</span>
                </div>

                <div className="mt-3 rounded-lg border-l-4 border-indigo-500 bg-[#2b2d31] p-4 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">🌌 Galaxy Bot • System Status</span>
                    <span className="text-emerald-400 font-mono text-[11px]">ALL SYSTEMS ONLINE</span>
                  </div>
                  <p className="text-neutral-300">
                    Cluster 0 operational on Discord Gateway. Anti-Nuke interceptor running with 0 warnings in last 24h.
                  </p>
                  <div className="pt-2 grid grid-cols-2 gap-2 text-[11px] text-neutral-400">
                    <div><strong>Creator:</strong> xSeif</div>
                    <div><strong>Architecture:</strong> Hybrid Sharding</div>
                  </div>
                </div>

                {/* Discord interactive action buttons */}
                <div className="mt-3 flex flex-wrap gap-2">
                  <button className="rounded bg-[#5865F2] hover:bg-[#4752C4] px-3 py-1.5 text-xs font-medium text-white transition">
                    Open Ticket
                  </button>
                  <button className="rounded bg-[#4e5058] hover:bg-[#6d6f78] px-3 py-1.5 text-xs font-medium text-white transition">
                    View Rank Card
                  </button>
                  <button className="rounded bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 text-xs font-medium text-white transition">
                    Verify Identity
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Modern Footer */}
      <footer className="border-t border-white/5 bg-space-950/80 py-10 px-6 z-10 text-center text-xs text-neutral-400">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-xs">
              G
            </div>
            <span className="font-semibold text-white">Galaxy Bot Ecosystem</span>
          </div>

          <p>
            Created & Maintained by{' '}
            <a
              href="https://github.com/xSeiff"
              target="_blank"
              rel="noreferrer"
              className="text-indigo-400 hover:text-indigo-300 font-medium underline underline-offset-4"
            >
              xSeif
            </a>
          </p>

          <div className="flex items-center gap-4 text-neutral-400">
            <Link href="/dashboard/100000000000000000" className="hover:text-white transition">
              Dashboard
            </Link>
            <a href="https://github.com/xSeiff" target="_blank" rel="noreferrer" className="hover:text-white transition">
              GitHub
            </a>
            <span className="text-emerald-400">• Operational</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
