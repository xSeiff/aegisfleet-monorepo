'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  Sliders,
  Save,
  CheckCircle2,
  Globe,
  Radio,
  FileText,
  Clock,
  Shield,
  Loader2,
} from 'lucide-react';

export default function GeneralAndLoggingPage() {
  const params = useParams();
  const guildId = params?.guildId as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [savedToast, setSavedToast] = useState(false);

  const [prefix, setPrefix] = useState('!');
  const [language, setLanguage] = useState('en-US');
  const [timezone, setTimezone] = useState('UTC');

  const [msgDeleteChannel, setMsgDeleteChannel] = useState('');
  const [msgEditChannel, setMsgEditChannel] = useState('');
  const [voiceChannel, setVoiceChannel] = useState('');
  const [memberChannel, setMemberChannel] = useState('');
  const [modLogChannel, setModLogChannel] = useState('');

  useEffect(() => {
    async function loadSettings() {
      if (!guildId) return;
      try {
        const res = await fetch(`/api/guilds/${guildId}/settings`);
        if (res.ok) {
          const json = await res.json();
          if (json.data) {
            setPrefix(json.data.prefix || '!');
            setLanguage(json.data.language || 'en-US');
            setTimezone(json.data.timezone || 'UTC');

            if (json.data.loggingGrid) {
              setMsgDeleteChannel(json.data.loggingGrid.messageDeleteChannelId || '');
              setMsgEditChannel(json.data.loggingGrid.messageEditChannelId || '');
              setVoiceChannel(json.data.loggingGrid.voiceLogChannelId || '');
              setMemberChannel(json.data.loggingGrid.memberLogChannelId || '');
            }
          }
        }
      } catch (err) {
        console.error('Failed to load guild general settings:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadSettings();
  }, [guildId]);

  const handleSave = async () => {
    if (!guildId) return;
    setIsSaving(true);

    try {
      const res = await fetch(`/api/guilds/${guildId}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prefix,
          language,
          timezone,
          logging: {
            messageDeleteChannelId: msgDeleteChannel || null,
            messageEditChannelId: msgEditChannel || null,
            voiceLogChannelId: voiceChannel || null,
            memberLogChannelId: memberChannel || null,
          },
        }),
      });

      if (res.ok) {
        setSavedToast(true);
        setTimeout(() => setSavedToast(false), 3000);
      }
    } catch (err) {
      console.error('Error saving settings:', err);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 text-indigo-400 animate-spin" />
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
              <Sliders className="h-7 w-7 text-indigo-400" />
              <span>General Settings & Multi-Channel Logging</span>
            </h1>
            <span className="rounded-full bg-indigo-500/10 px-2.5 py-0.5 text-xs font-semibold text-indigo-400 border border-indigo-500/20">
              Live DB Synced
            </span>
          </div>
          <p className="mt-1 text-sm text-neutral-400">
            Configure server prefix, language locale, timezone, and the multi-stream audit logging grid for Guild <span className="font-mono text-indigo-400">{guildId}</span>.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2.5 text-xs font-bold text-white shadow-glow-indigo hover:from-indigo-500 hover:to-purple-500 transition active:scale-95 self-start sm:self-auto disabled:opacity-50"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              <span>Save to PostgreSQL</span>
            </>
          )}
        </button>
      </div>

      {savedToast && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs text-emerald-300 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>General configurations & logging channels saved to database!</span>
          </div>
          <span className="font-mono text-[10px] text-emerald-400">UPDATED</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Core Settings */}
        <section className="glass-panel rounded-2xl p-6 space-y-5">
          <h2 className="text-base font-bold text-white flex items-center gap-2 pb-3 border-b border-white/5">
            <Globe className="h-4 w-4 text-indigo-400" />
            <span>Bot Locale & Command Prefix</span>
          </h2>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
              Chat Command Prefix
            </label>
            <input
              type="text"
              value={prefix}
              onChange={(e) => setPrefix(e.target.value)}
              className="w-full rounded-xl border border-neutral-800 bg-space-950 px-3.5 py-2.5 text-xs font-mono text-indigo-400 placeholder-neutral-500 focus:border-indigo-500 focus:outline-none"
            />
            <span className="text-[11px] text-neutral-500 mt-1 block">
              Default fallback prefix for text chat commands.
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
              Dashboard & Bot Language
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full rounded-xl border border-neutral-800 bg-space-950 px-3.5 py-2.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
            >
              <option value="en-US">English (US)</option>
              <option value="es-ES">Spanish (Español)</option>
              <option value="fr-FR">French (Français)</option>
              <option value="de-DE">German (Deutsch)</option>
              <option value="ar-SA">Arabic (العربية)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
              Server Timezone
            </label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full rounded-xl border border-neutral-800 bg-space-950 px-3.5 py-2.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
            >
              <option value="UTC">UTC (Universal Coordinated Time)</option>
              <option value="America/New_York">US Eastern (EST/EDT)</option>
              <option value="America/Los_Angeles">US Pacific (PST/PDT)</option>
              <option value="Europe/London">London (GMT/BST)</option>
              <option value="Asia/Tokyo">Tokyo (JST)</option>
            </select>
          </div>
        </section>

        {/* Logging Grid */}
        <section className="glass-panel rounded-2xl p-6 space-y-5">
          <h2 className="text-base font-bold text-white flex items-center gap-2 pb-3 border-b border-white/5">
            <Radio className="h-4 w-4 text-purple-400" />
            <span>Multi-Channel Logging Grid (15+ Events)</span>
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Deleted Messages Channel ID
              </label>
              <input
                type="text"
                placeholder="Channel Snowflake ID..."
                value={msgDeleteChannel}
                onChange={(e) => setMsgDeleteChannel(e.target.value)}
                className="w-full rounded-xl border border-neutral-800 bg-space-950 px-3.5 py-2 text-xs font-mono text-indigo-400 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Edited Messages Channel ID
              </label>
              <input
                type="text"
                placeholder="Channel Snowflake ID..."
                value={msgEditChannel}
                onChange={(e) => setMsgEditChannel(e.target.value)}
                className="w-full rounded-xl border border-neutral-800 bg-space-950 px-3.5 py-2 text-xs font-mono text-indigo-400 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Voice Join/Leave Channel ID
              </label>
              <input
                type="text"
                placeholder="Channel Snowflake ID..."
                value={voiceChannel}
                onChange={(e) => setVoiceChannel(e.target.value)}
                className="w-full rounded-xl border border-neutral-800 bg-space-950 px-3.5 py-2 text-xs font-mono text-indigo-400 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1">
                Member Joins & Leaves Channel ID
              </label>
              <input
                type="text"
                placeholder="Channel Snowflake ID..."
                value={memberChannel}
                onChange={(e) => setMemberChannel(e.target.value)}
                className="w-full rounded-xl border border-neutral-800 bg-space-950 px-3.5 py-2 text-xs font-mono text-indigo-400 focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
