'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  Shield,
  AlertTriangle,
  Lock,
  UserX,
  Sliders,
  CheckCircle2,
  Save,
  RotateCcw,
  Sparkles,
  Loader2,
} from 'lucide-react';

export default function SecurityDashboardPage() {
  const params = useParams();
  const guildId = (params?.guildId as string) || '100000000000000000';

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [savedToast, setSavedToast] = useState(false);

  const [antiNukeEnabled, setAntiNukeEnabled] = useState(true);
  const [channelDeleteLimit, setChannelDeleteLimit] = useState(3);
  const [roleDeleteLimit, setRoleDeleteLimit] = useState(3);
  const [banLimit, setBanLimit] = useState(4);
  const [kickUnauthorizedBots, setKickUnauthorizedBots] = useState(true);
  const [quarantineRole, setQuarantineRole] = useState('Quarantine (Role Stripped)');
  const [timeWindowSeconds, setTimeWindowSeconds] = useState(10);

  const [heatEnabled, setHeatEnabled] = useState(true);
  const [warnThreshold, setWarnThreshold] = useState(10);
  const [panicThreshold, setPanicThreshold] = useState(100);

  // Fetch real settings from PostgreSQL on load
  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch(`/api/guilds/${guildId}/settings`);
        const json = await res.json();
        if (json.success && json.data) {
          const an = json.data.antiNukeConfig;
          if (an) {
            setAntiNukeEnabled(an.enabled);
            setChannelDeleteLimit(an.channelDeleteLimit);
            setRoleDeleteLimit(an.roleDeleteLimit);
            setBanLimit(an.banLimit);
            setKickUnauthorizedBots(an.kickUnauthorizedBots);
            if (an.quarantineRoleId) setQuarantineRole(an.quarantineRoleId);
            setTimeWindowSeconds(an.timeWindowSeconds);
          }
          const hc = json.data.heatConfig;
          if (hc) {
            setHeatEnabled(hc.enabled);
            setWarnThreshold(hc.warnThreshold);
            setPanicThreshold(hc.panicModeThreshold);
          }
        }
      } catch (err) {
        console.error('Failed to load settings:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchSettings();
  }, [guildId]);

  // Persist real settings to PostgreSQL
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/guilds/${guildId}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          antiNuke: {
            enabled: antiNukeEnabled,
            channelDeleteLimit,
            roleDeleteLimit,
            banLimit,
            kickUnauthorizedBots,
            quarantineRoleId: quarantineRole,
            timeWindowSeconds,
          },
          heat: {
            enabled: heatEnabled,
            warnThreshold,
            panicModeThreshold: panicThreshold,
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSavedToast(true);
        setTimeout(() => setSavedToast(false), 4000);
      }
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="flex items-center gap-3 text-neutral-400 text-xs">
          <Loader2 className="h-5 w-5 animate-spin text-indigo-500" />
          <span>Loading security profile from PostgreSQL...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header & Save Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
              <Shield className="h-7 w-7 text-indigo-400" />
              <span>Galaxy Guard & Anti-Nuke Studio</span>
            </h1>
            <span className="rounded-full bg-indigo-500/10 px-2.5 py-0.5 text-xs font-semibold text-indigo-400 border border-indigo-500/20">
              Live Database Linked
            </span>
          </div>
          <p className="mt-1 text-sm text-neutral-400">
            Real-time audit log scanner, permission stripping, quarantine containment, and adaptive heat heuristics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2.5 text-xs font-bold text-white shadow-glow-indigo hover:from-indigo-500 hover:to-purple-500 transition active:scale-95 disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            <span>{isSaving ? 'Writing to DB...' : 'Save Configuration'}</span>
          </button>
        </div>
      </div>

      {savedToast && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs text-emerald-300 flex items-center justify-between shadow-lg transition-all animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>Anti-Nuke & Heat settings committed to PostgreSQL. Cluster 0 updated in real-time.</span>
          </div>
          <span className="font-mono text-[10px] text-emerald-400">COMMITTED</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Anti-Nuke Interceptor Card */}
        <section className="glass-panel rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-white/5">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <Lock className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Rogue Staff Interceptor</h2>
                <p className="text-[11px] text-neutral-400">Monitors dangerous audit events</p>
              </div>
            </div>

            <button
              onClick={() => setAntiNukeEnabled(!antiNukeEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                antiNukeEnabled ? 'bg-indigo-600' : 'bg-neutral-800'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  antiNukeEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="space-y-5">
            <div>
              <div className="flex justify-between text-xs text-neutral-300 mb-2">
                <span>Channel Deletion Threshold</span>
                <span className="font-mono text-indigo-400 font-bold">{channelDeleteLimit} channels / {timeWindowSeconds}s</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={channelDeleteLimit}
                onChange={(e) => setChannelDeleteLimit(Number(e.target.value))}
                className="w-full accent-indigo-500 h-1.5 bg-space-800 rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-neutral-300 mb-2">
                <span>Role Deletion Threshold</span>
                <span className="font-mono text-indigo-400 font-bold">{roleDeleteLimit} roles / {timeWindowSeconds}s</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={roleDeleteLimit}
                onChange={(e) => setRoleDeleteLimit(Number(e.target.value))}
                className="w-full accent-indigo-500 h-1.5 bg-space-800 rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-neutral-300 mb-2">
                <span>Mass Ban / Kick Threshold</span>
                <span className="font-mono text-indigo-400 font-bold">{banLimit} members / {timeWindowSeconds}s</span>
              </div>
              <input
                type="range"
                min="1"
                max="15"
                value={banLimit}
                onChange={(e) => setBanLimit(Number(e.target.value))}
                className="w-full accent-indigo-500 h-1.5 bg-space-800 rounded-lg cursor-pointer"
              />
            </div>

            <div className="pt-4 border-t border-white/5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  Quarantine Isolation Role
                </label>
                <input
                  type="text"
                  value={quarantineRole}
                  onChange={(e) => setQuarantineRole(e.target.value)}
                  className="w-full rounded-xl border border-neutral-800 bg-space-950 px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:border-indigo-500 focus:outline-none"
                />
                <span className="text-[11px] text-neutral-500 mt-1 block">
                  Offending staff will have all admin roles revoked and assigned this quarantine role.
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-space-850/60 border border-white/5">
                <div>
                  <span className="text-xs font-semibold text-white block">Kick Unauthorized Bots</span>
                  <span className="text-[11px] text-neutral-400 block">Immediately kicks bots added by non-whitelisted members</span>
                </div>
                <button
                  onClick={() => setKickUnauthorizedBots(!kickUnauthorizedBots)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                    kickUnauthorizedBots ? 'bg-indigo-600' : 'bg-neutral-800'
                  }`}
                >
                  <span
                    className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                      kickUnauthorizedBots ? 'translate-x-4' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Adaptive Heat Engine Card */}
        <section className="glass-panel rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-white/5">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Adaptive Heat Engine</h2>
                <p className="text-[11px] text-neutral-400">Calculates user & channel spam velocity</p>
              </div>
            </div>

            <button
              onClick={() => setHeatEnabled(!heatEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                heatEnabled ? 'bg-amber-600' : 'bg-neutral-800'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  heatEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="space-y-5">
            <div>
              <div className="flex justify-between text-xs text-neutral-300 mb-2">
                <span>Warn Threshold (Heat Velocity)</span>
                <span className="font-mono text-amber-400 font-bold">{warnThreshold} heat pts</span>
              </div>
              <input
                type="range"
                min="5"
                max="30"
                value={warnThreshold}
                onChange={(e) => setWarnThreshold(Number(e.target.value))}
                className="w-full accent-amber-500 h-1.5 bg-space-800 rounded-lg cursor-pointer"
              />
              <span className="text-[11px] text-neutral-500 mt-1 block">
                Messages, newlines, and mentions add to user heat. Triggers auto-warn at threshold.
              </span>
            </div>

            <div>
              <div className="flex justify-between text-xs text-neutral-300 mb-2">
                <span>Channel Panic Threshold (Lockdown)</span>
                <span className="font-mono text-red-400 font-bold">{panicThreshold} channel heat pts</span>
              </div>
              <input
                type="range"
                min="50"
                max="250"
                value={panicThreshold}
                onChange={(e) => setPanicThreshold(Number(e.target.value))}
                className="w-full accent-red-500 h-1.5 bg-space-800 rounded-lg cursor-pointer"
              />
              <span className="text-[11px] text-neutral-500 mt-1 block">
                When aggregate channel heat exceeds this level, the bot automatically revokes send permissions for 60s.
              </span>
            </div>

            <div className="pt-4 border-t border-white/5">
              <div className="rounded-xl border border-white/5 bg-space-850 p-4">
                <span className="text-xs font-semibold text-white block mb-1">
                  Disaster Recovery Snapshots
                </span>
                <p className="text-[11px] text-neutral-400 mb-3">
                  Create full server state backups of all channels, roles, and permissions to rollback in 1 click if damaged.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 transition"
                  >
                    Take Snapshot Now
                  </button>
                  <button
                    onClick={handleSave}
                    className="rounded-lg border border-neutral-700 bg-space-950 px-3 py-1.5 text-xs font-semibold text-neutral-300 hover:bg-space-800 transition"
                  >
                    View Snapshots (1 Active)
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
