'use client';

import React, { useState } from 'react';
import {
  TrendingUp,
  Save,
  CheckCircle2,
  Plus,
  Trash2,
  Award,
  Mic,
  MessageSquare,
  Sparkles,
  Eye,
} from 'lucide-react';

export default function LevelingSettingsPage() {
  const [savedToast, setSavedToast] = useState(false);
  const [textXpEnabled, setTextXpEnabled] = useState(true);
  const [voiceXpEnabled, setVoiceXpEnabled] = useState(true);
  const [levelUpChannel, setLevelUpChannel] = useState('#level-ups');
  const [weekendBoost, setWeekendBoost] = useState('1.5');
  const [roleLadder, setRoleLadder] = useState([
    { level: 5, role: '@Active Explorer' },
    { level: 15, role: '@Star Pilot' },
    { level: 30, role: '@Galaxy Veteran' },
    { level: 50, role: '@Cosmic Legend' },
  ]);
  const [newLevel, setNewLevel] = useState('');
  const [newRole, setNewRole] = useState('');

  const handleSave = () => {
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 3000);
  };

  const handleAddMilestone = () => {
    if (!newLevel || !newRole) return;
    setRoleLadder([...roleLadder, { level: Number(newLevel), role: newRole.startsWith('@') ? newRole : `@${newRole}` }]);
    setNewLevel('');
    setNewRole('');
  };

  const handleRemoveMilestone = (idx: number) => {
    setRoleLadder(roleLadder.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
              <TrendingUp className="h-7 w-7 text-indigo-400" />
              <span>Leveling & Activity Progression</span>
            </h1>
            <span className="rounded-full bg-indigo-500/10 px-2.5 py-0.5 text-xs font-semibold text-indigo-400 border border-indigo-500/20">
              XP Curves Active
            </span>
          </div>
          <p className="mt-1 text-sm text-neutral-400">
            Configure text & voice XP accumulation curves, anti-AFK penalties, multipliers, and automated role rewards.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2.5 text-xs font-bold text-white shadow-glow-indigo hover:from-indigo-500 hover:to-purple-500 transition active:scale-95 self-start sm:self-auto"
        >
          <Save className="h-4 w-4" />
          <span>Save Progression Rules</span>
        </button>
      </div>

      {savedToast && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs text-emerald-300 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>Leveling configuration synced with PostgreSQL and Redis XP cache.</span>
          </div>
          <span className="font-mono text-[10px] text-emerald-400">SYNCED</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Core Progression */}
        <section className="glass-panel rounded-2xl p-6 space-y-5">
          <h2 className="text-base font-bold text-white flex items-center gap-2 pb-3 border-b border-white/5">
            <Sparkles className="h-4 w-4 text-indigo-400" />
            <span>XP Accumulation & Tracking</span>
          </h2>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-space-850/60 border border-white/5">
              <div>
                <span className="text-xs font-semibold text-white block">Text Message XP</span>
                <span className="text-[11px] text-neutral-400 block">Awards 15-25 XP per minute of chat activity (1 min cooldown)</span>
              </div>
              <button
                onClick={() => setTextXpEnabled(!textXpEnabled)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                  textXpEnabled ? 'bg-indigo-600' : 'bg-neutral-800'
                }`}
              >
                <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${textXpEnabled ? 'translate-x-4' : 'translate-x-1'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-space-850/60 border border-white/5">
              <div>
                <span className="text-xs font-semibold text-white block">Voice Channel XP</span>
                <span className="text-[11px] text-neutral-400 block">Awards 10 XP/min in unmuted voice channels with 2+ members</span>
              </div>
              <button
                onClick={() => setVoiceXpEnabled(!voiceXpEnabled)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                  voiceXpEnabled ? 'bg-indigo-600' : 'bg-neutral-800'
                }`}
              >
                <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${voiceXpEnabled ? 'translate-x-4' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
              Level-Up Announcement Channel
            </label>
            <input
              type="text"
              value={levelUpChannel}
              onChange={(e) => setLevelUpChannel(e.target.value)}
              className="w-full rounded-xl border border-neutral-800 bg-space-950 px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
              Weekend Multiplier Boost
            </label>
            <select
              value={weekendBoost}
              onChange={(e) => setWeekendBoost(e.target.value)}
              className="w-full rounded-xl border border-neutral-800 bg-space-950 px-3.5 py-2.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
            >
              <option value="1.0">1.0x (Standard XP)</option>
              <option value="1.5">1.5x (50% Weekend Boost)</option>
              <option value="2.0">2.0x (Double XP Weekend)</option>
            </select>
          </div>

          {/* Live Rank Card Mockup */}
          <div className="pt-3 border-t border-white/5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3 flex items-center gap-1.5">
              <Eye className="h-3.5 w-3.5 text-indigo-400" />
              <span>Canvas Rank Card Preview (/galaxy rank)</span>
            </h3>

            <div className="rounded-2xl border border-white/10 bg-space-950 p-4 shadow-xl">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-full bg-indigo-600/30 border-2 border-indigo-500 flex items-center justify-center text-xl shrink-0">
                  👨‍🚀
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">Astronaut</span>
                    <span className="text-xs font-mono text-indigo-400 font-bold">LEVEL 24</span>
                  </div>
                  <div className="mt-2 w-full bg-space-800 rounded-full h-2 overflow-hidden">
                    <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full w-[65%]" />
                  </div>
                  <div className="mt-1 flex justify-between text-[10px] text-neutral-400 font-mono">
                    <span>Rank #1</span>
                    <span>4,850 / 7,500 XP</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Role Reward Ladder */}
        <section className="glass-panel rounded-2xl p-6 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Award className="h-4 w-4 text-amber-400" />
              <span>Automated Role Reward Ladder</span>
            </h2>
            <span className="text-xs font-mono text-neutral-400">{roleLadder.length} Milestones</span>
          </div>

          <p className="text-xs text-neutral-400">
            Roles are automatically assigned to members as soon as they reach the designated level threshold.
          </p>

          <div className="space-y-2">
            {roleLadder.map((r, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-xl bg-space-950 p-3 border border-white/5 hover:border-white/10 transition"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 text-xs font-mono font-bold">
                    {r.level}
                  </span>
                  <span className="text-xs font-semibold text-white">{r.role}</span>
                </div>
                <button
                  onClick={() => handleRemoveMilestone(i)}
                  className="text-neutral-500 hover:text-red-400 transition p-1"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>

          {/* Add milestone form */}
          <div className="pt-3 border-t border-white/5 space-y-3">
            <span className="text-xs font-semibold text-neutral-300 block">Add Milestone Reward</span>
            <div className="grid grid-cols-3 gap-2">
              <input
                type="number"
                placeholder="Level (e.g. 75)"
                value={newLevel}
                onChange={(e) => setNewLevel(e.target.value)}
                className="rounded-xl border border-neutral-800 bg-space-950 px-3 py-2 text-xs text-white placeholder-neutral-500 focus:border-indigo-500 focus:outline-none"
              />
              <input
                type="text"
                placeholder="Role name"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="col-span-2 rounded-xl border border-neutral-800 bg-space-950 px-3 py-2 text-xs text-white placeholder-neutral-500 focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <button
              onClick={handleAddMilestone}
              className="w-full rounded-xl border border-indigo-500/30 bg-indigo-500/10 py-2 text-xs font-semibold text-indigo-300 hover:bg-indigo-500/20 transition flex items-center justify-center gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Level Role</span>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
