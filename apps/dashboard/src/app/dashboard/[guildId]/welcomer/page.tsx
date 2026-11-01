'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  Palette,
  Save,
  CheckCircle2,
  Image,
  Eye,
  MessageSquare,
  Sparkles,
  Sliders,
  Loader2,
} from 'lucide-react';

export default function WelcomerDashboardPage() {
  const params = useParams();
  const guildId = (params?.guildId as string) || '100000000000000000';

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [savedToast, setSavedToast] = useState(false);

  const [welcomerEnabled, setWelcomerEnabled] = useState(true);
  const [welcomeMsg, setWelcomeMsg] = useState('Welcome {user} to {server}! You are member #{count} 🎉');
  const [channelName, setChannelName] = useState('#welcome-and-rules');
  const [borderColor, setBorderColor] = useState('#6366f1');
  const [backgroundTheme, setBackgroundTheme] = useState('galaxy');
  const [showAvatar, setShowAvatar] = useState(true);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch(`/api/guilds/${guildId}/settings`);
        const json = await res.json();
        if (json.success && json.data?.welcomerConfig) {
          const wc = json.data.welcomerConfig;
          if (wc.welcomeMessage) setWelcomeMsg(wc.welcomeMessage);
          if (wc.cardBorderColor) setBorderColor(wc.cardBorderColor);
          if (wc.showAvatar !== undefined) setShowAvatar(wc.showAvatar);
        }
      } catch (err) {
        console.error('Error loading welcomer settings:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchSettings();
  }, [guildId]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/guilds/${guildId}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          welcomer: {
            welcomeMessage: welcomeMsg,
            cardBorderColor: borderColor,
            showAvatar,
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

  const bgStyles: Record<string, string> = {
    galaxy: 'radial-gradient(ellipse at top, #1e1b4b, #0f172a, #020617)',
    nebula: 'radial-gradient(circle at 50% 50%, #581c87, #1e1b4b, #030712)',
    cyber: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #064e3b 100%)',
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="flex items-center gap-3 text-neutral-400 text-xs">
          <Loader2 className="h-5 w-5 animate-spin text-indigo-500" />
          <span>Loading welcomer configuration from PostgreSQL...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
              <Palette className="h-7 w-7 text-purple-400" />
              <span>Welcomer & Canvas Studio</span>
            </h1>
            <span className="rounded-full bg-purple-500/10 px-2.5 py-0.5 text-xs font-semibold text-purple-400 border border-purple-500/20">
              Live Database Linked
            </span>
          </div>
          <p className="mt-1 text-sm text-neutral-400">
            Design GPU-rendered dynamic Canvas cards with avatar cutouts, custom backgrounds, and variable placeholders.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2.5 text-xs font-bold text-white shadow-glow-indigo hover:from-indigo-500 hover:to-purple-500 transition active:scale-95 self-start sm:self-auto disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          <span>{isSaving ? 'Writing to DB...' : 'Save Studio Settings'}</span>
        </button>
      </div>

      {savedToast && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs text-emerald-300 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>Welcomer canvas template saved to PostgreSQL and loaded into Cluster render cache.</span>
          </div>
          <span className="font-mono text-[10px] text-emerald-400">COMMITTED</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Editor Controls */}
        <div className="glass-panel rounded-2xl p-6 space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-white/5">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Sliders className="h-4 w-4 text-indigo-400" />
              <span>Card & Banner Customization</span>
            </h2>

            <button
              onClick={() => setWelcomerEnabled(!welcomerEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                welcomerEnabled ? 'bg-purple-600' : 'bg-neutral-800'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${welcomerEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
              Welcome Announcement Channel
            </label>
            <input
              type="text"
              value={channelName}
              onChange={(e) => setChannelName(e.target.value)}
              className="w-full rounded-xl border border-neutral-800 bg-space-950 px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
              Message Template
            </label>
            <textarea
              value={welcomeMsg}
              onChange={(e) => setWelcomeMsg(e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-neutral-800 bg-space-950 px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:border-indigo-500 focus:outline-none"
            />
            <span className="text-[11px] text-neutral-500 mt-1 block">
              Placeholders: <code className="text-indigo-400 font-mono">{'{user}'}</code>, <code className="text-indigo-400 font-mono">{'{server}'}</code>, <code className="text-indigo-400 font-mono">{'{count}'}</code>
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
              Background Canvas Theme
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['galaxy', 'nebula', 'cyber'].map((theme) => (
                <button
                  key={theme}
                  type="button"
                  onClick={() => setBackgroundTheme(theme)}
                  className={`rounded-xl border p-2.5 text-xs font-semibold uppercase tracking-wider transition ${
                    backgroundTheme === theme
                      ? 'border-indigo-500 bg-indigo-500/20 text-white'
                      : 'border-white/5 bg-space-950 text-neutral-400 hover:text-white'
                  }`}
                >
                  {theme}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
              Canvas Ring Accent Color
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={borderColor}
                onChange={(e) => setBorderColor(e.target.value)}
                className="h-9 w-9 rounded-lg border border-neutral-800 bg-space-950 cursor-pointer p-0.5"
              />
              <input
                type="text"
                value={borderColor}
                onChange={(e) => setBorderColor(e.target.value)}
                className="flex-1 rounded-xl border border-neutral-800 bg-space-950 px-3 py-2 text-xs font-mono text-white"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-white/5 flex items-center justify-between p-3 rounded-xl bg-space-850/60 border border-white/5">
            <div>
              <span className="text-xs font-semibold text-white block">Render Member Avatar Cutout</span>
              <span className="text-[11px] text-neutral-400 block">Includes circular Discord avatar with glowing border</span>
            </div>
            <button
              onClick={() => setShowAvatar(!showAvatar)}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                showAvatar ? 'bg-indigo-600' : 'bg-neutral-800'
              }`}
            >
              <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${showAvatar ? 'translate-x-4' : 'translate-x-1'}`} />
            </button>
          </div>
        </div>

        {/* Live Canvas Preview Card */}
        <div className="glass-panel rounded-2xl p-6 space-y-4 flex flex-col">
          <h2 className="text-base font-bold text-white flex items-center gap-2 pb-3 border-b border-white/5">
            <Eye className="h-4 w-4 text-indigo-400" />
            <span>Real-Time Canvas Card Render</span>
          </h2>

          <div className="flex-1 flex flex-col justify-center">
            <div
              className="relative overflow-hidden rounded-2xl p-8 text-center shadow-2xl flex flex-col items-center justify-center border transition-all"
              style={{
                background: bgStyles[backgroundTheme],
                borderColor: `${borderColor}55`,
              }}
            >
              {/* Avatar circle */}
              {showAvatar && (
                <div
                  className="h-24 w-24 rounded-full flex items-center justify-center text-4xl shadow-2xl relative mb-4 transition-transform"
                  style={{
                    boxShadow: `0 0 30px ${borderColor}66`,
                    border: `4px solid ${borderColor}`,
                    background: '#0f172a',
                  }}
                >
                  <span>🌌</span>
                  <span className="absolute bottom-0 right-0 h-5 w-5 rounded-full bg-emerald-500 border-2 border-[#0f172a]"></span>
                </div>
              )}

              {/* Title & Name */}
              <span className="text-xs font-extrabold uppercase tracking-[0.2em] text-neutral-400">
                WELCOME TO THE GALAXY
              </span>
              <h3 className="text-2xl font-black text-white mt-1 tracking-tight">
                Astronaut#0001
              </h3>

              {/* Member Count Pill */}
              <div
                className="mt-3 inline-flex items-center gap-1.5 rounded-full px-4 py-1 text-xs font-bold text-white"
                style={{ background: `${borderColor}33`, border: `1px solid ${borderColor}66` }}
              >
                <span>MEMBER #1,342</span>
              </div>
            </div>

            {/* Message preview below card */}
            <div className="mt-4 rounded-xl border border-white/5 bg-space-950 p-3.5 text-xs text-neutral-300">
              <span className="text-neutral-500 font-semibold uppercase text-[10px] block mb-1">Text Message Output</span>
              <p>
                {welcomeMsg
                  .replace('{user}', '@Astronaut')
                  .replace('{server}', 'Galaxy HQ')
                  .replace('{count}', '1,342')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
