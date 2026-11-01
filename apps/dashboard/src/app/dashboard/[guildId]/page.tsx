import React from 'react';
import { ShardMonitor } from '../../../components/telemetry/ShardMonitor';
import { RegexTester } from '../../../components/automod/RegexTester';
import {
  Shield,
  Activity,
  Users,
  Ticket,
  Lock,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Server,
  Sparkles,
} from 'lucide-react';

export default async function GuildDashboardPage({
  params,
}: {
  params: Promise<{ guildId: string }>;
}) {
  const { guildId } = await params;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-extrabold tracking-tight text-white">
              Guild Mission Control
            </h1>
            <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-400 border border-emerald-500/20">
              Galaxy Guard Active
            </span>
          </div>
          <p className="mt-1 text-sm text-neutral-400">
            Real-time hybrid sharding telemetry, anti-nuke audit logs, and security heuristics for Guild <span className="font-mono text-indigo-400 font-semibold">{guildId}</span>.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <button className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-glow-indigo hover:bg-indigo-500 transition">
            <Sparkles className="h-4 w-4" />
            <span>Create Disaster Snapshot</span>
          </button>
        </div>
      </div>

      {/* Metric Highlights */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-panel rounded-2xl p-5">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Protected Channels</span>
            <Lock className="h-4 w-4 text-indigo-400" />
          </div>
          <p className="text-3xl font-black text-white">42</p>
          <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            <span>100% Anti-Nuke Monitored</span>
          </p>
        </div>

        <div className="glass-panel rounded-2xl p-5">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Quarantined Staff</span>
            <Shield className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="text-3xl font-black text-white">0</p>
          <p className="text-[11px] text-neutral-400 mt-1">
            No unauthorized breaches
          </p>
        </div>

        <div className="glass-panel rounded-2xl p-5">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Open Tickets</span>
            <Ticket className="h-4 w-4 text-amber-400" />
          </div>
          <p className="text-3xl font-black text-white">3</p>
          <p className="text-[11px] text-amber-400 mt-1 flex items-center gap-1">
            <Activity className="h-3 w-3" />
            <span>Avg Response: 4.2m</span>
          </p>
        </div>

        <div className="glass-panel rounded-2xl p-5">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Cluster Heartbeat</span>
            <Zap className="h-4 w-4 text-cyan-400" />
          </div>
          <p className="text-3xl font-black text-cyan-400">15ms</p>
          <p className="text-[11px] text-neutral-400 mt-1">
            Shard #0 (Zero Packet Loss)
          </p>
        </div>
      </div>

      {/* Main Grid: Telemetry & Regex Tester */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Activity className="h-5 w-5 text-indigo-400" />
              <span>Real-Time Shard & Cluster Telemetry</span>
            </h2>
            <span className="text-xs text-neutral-400">Auto-refreshing</span>
          </div>
          <ShardMonitor />
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Shield className="h-5 w-5 text-purple-400" />
              <span>Security Heuristics & Regex Shield</span>
            </h2>
            <span className="text-xs text-neutral-400">Live Simulator</span>
          </div>
          <RegexTester />
        </section>
      </div>

      {/* Live Anti-Nuke Audit Log Activity Feed */}
      <div className="glass-panel rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/5">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Shield className="h-4 w-4 text-indigo-400" />
            <span>Recent Galaxy Guard Audit Logs</span>
          </h3>
          <span className="text-xs text-neutral-400">Live Interceptor Feed</span>
        </div>

        <div className="space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between p-3 rounded-xl bg-space-850/60 border border-white/5">
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
              <span className="text-neutral-300">Cluster 0 Telemetry Beat Synced</span>
              <span className="text-neutral-500 text-[11px]">• 4 shards healthy</span>
            </div>
            <span className="text-neutral-500">Just now</span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-space-850/60 border border-white/5">
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-indigo-400"></span>
              <span className="text-neutral-300">Disaster Snapshot created for Guild {guildId}</span>
              <span className="text-neutral-500 text-[11px]">• 42 channels, 18 roles preserved</span>
            </div>
            <span className="text-neutral-500">2 mins ago</span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-space-850/60 border border-white/5">
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
              <span className="text-neutral-300">JoinGate Bot Add verification verified clean</span>
              <span className="text-neutral-500 text-[11px]">• Authorized executor</span>
            </div>
            <span className="text-neutral-500">14 mins ago</span>
          </div>
        </div>
      </div>
    </div>
  );
}
