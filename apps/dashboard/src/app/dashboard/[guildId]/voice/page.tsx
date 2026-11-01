'use client';

import React, { useState } from 'react';
import {
  Mic,
  Save,
  CheckCircle2,
  Sparkles,
  Users,
  Radio,
  Sliders,
  Share2,
} from 'lucide-react';

export default function VoiceAndPerksDashboardPage() {
  const [savedToast, setSavedToast] = useState(false);
  const [jtcEnabled, setJtcEnabled] = useState(true);
  const [hubChannelName, setHubChannelName] = useState('➕ Join to Create');
  const [namingTemplate, setNamingTemplate] = useState("{user}'s Orbit");
  const [bitrate, setBitrate] = useState(96000);
  const [userLimit, setUserLimit] = useState(0);
  const [allowBoosterShare, setAllowBoosterShare] = useState(true);
  const [maxSharedFriends, setMaxSharedFriends] = useState(2);

  const handleSave = () => {
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 3000);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
              <Mic className="h-7 w-7 text-indigo-400" />
              <span>Voice Rooms & Vanity Booster Perks</span>
            </h1>
            <span className="rounded-full bg-indigo-500/10 px-2.5 py-0.5 text-xs font-semibold text-indigo-400 border border-indigo-500/20">
              Dynamic JTC
            </span>
          </div>
          <p className="mt-1 text-sm text-neutral-400">
            Configure Join-to-Create dynamic rooms, auto-cleanup of empty voice channels, and booster vanity role sharing.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2.5 text-xs font-bold text-white shadow-glow-indigo hover:from-indigo-500 hover:to-purple-500 transition active:scale-95 self-start sm:self-auto"
        >
          <Save className="h-4 w-4" />
          <span>Save Voice Settings</span>
        </button>
      </div>

      {savedToast && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs text-emerald-300 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>Voice & Booster configurations saved and live on Discord Gateway.</span>
          </div>
          <span className="font-mono text-[10px] text-emerald-400">DEPLOYED</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* JTC Configuration */}
        <div className="glass-panel rounded-2xl p-6 space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-white/5">
            <div className="flex items-center gap-2">
              <Radio className="h-4 w-4 text-indigo-400" />
              <h2 className="text-base font-bold text-white">Join-to-Create (JTC) System</h2>
            </div>
            <button
              onClick={() => setJtcEnabled(!jtcEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                jtcEnabled ? 'bg-indigo-600' : 'bg-neutral-800'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${jtcEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
              Hub Trigger Channel Name
            </label>
            <input
              type="text"
              value={hubChannelName}
              onChange={(e) => setHubChannelName(e.target.value)}
              className="w-full rounded-xl border border-neutral-800 bg-space-950 px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:border-indigo-500 focus:outline-none"
            />
            <span className="text-[11px] text-neutral-500 mt-1 block">
              When members join this voice channel, a private room is created instantly and they are moved into it.
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
              Generated Channel Naming Scheme
            </label>
            <input
              type="text"
              value={namingTemplate}
              onChange={(e) => setNamingTemplate(e.target.value)}
              className="w-full rounded-xl border border-neutral-800 bg-space-950 px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                Default Audio Bitrate
              </label>
              <select
                value={bitrate}
                onChange={(e) => setBitrate(Number(e.target.value))}
                className="w-full rounded-xl border border-neutral-800 bg-space-950 px-3.5 py-2.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
              >
                <option value={64000}>64 kbps (Standard)</option>
                <option value={96000}>96 kbps (High Quality)</option>
                <option value={128000}>128 kbps (Tier 1 Boost)</option>
                <option value={256000}>256 kbps (Tier 2 Boost)</option>
                <option value={384000}>384 kbps (VIP / Tier 3)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                User Capacity Limit
              </label>
              <select
                value={userLimit}
                onChange={(e) => setUserLimit(Number(e.target.value))}
                className="w-full rounded-xl border border-neutral-800 bg-space-950 px-3.5 py-2.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
              >
                <option value={0}>Unlimited</option>
                <option value={2}>Duo (2 Members)</option>
                <option value={4}>Squad (4 Members)</option>
                <option value={8}>Party (8 Members)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Booster Perks */}
        <div className="glass-panel rounded-2xl p-6 space-y-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-white/5">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple-400" />
                <h2 className="text-base font-bold text-white">Booster Vanity Roles</h2>
              </div>
              <button
                onClick={() => setAllowBoosterShare(!allowBoosterShare)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  allowBoosterShare ? 'bg-purple-600' : 'bg-neutral-800'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${allowBoosterShare ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            <p className="text-xs text-neutral-400 mt-3 leading-relaxed">
              Boosters can create their own custom vanity role using <code className="text-purple-400 font-mono">/perks booster create</code> with custom name and hex color.
            </p>

            <div className="mt-4 p-4 rounded-xl bg-space-950 border border-white/5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white">Friend Sharing Quota</span>
                <span className="text-xs font-mono text-purple-400 font-bold">{maxSharedFriends} Friends / Booster</span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                value={maxSharedFriends}
                onChange={(e) => setMaxSharedFriends(Number(e.target.value))}
                className="w-full accent-purple-500 h-1.5 bg-space-800 rounded-lg cursor-pointer"
              />
              <span className="text-[11px] text-neutral-500 block">
                Automatic Unboost Cleanup: If the booster removes their boost, vanity roles are stripped from both the booster and shared friends automatically.
              </span>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-purple-500/20 bg-purple-500/5 text-xs text-purple-300">
            <span className="font-bold block mb-1">💡 Snipe & OSINT Utilities</span>
            <span>Channel snipers are active on Redis. Members can inspect the last deleted message via <code className="text-white font-mono">/perks snipe message</code>.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
