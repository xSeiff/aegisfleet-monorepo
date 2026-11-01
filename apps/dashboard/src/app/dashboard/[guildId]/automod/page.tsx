'use client';

import React, { useState } from 'react';
import { RegexTester } from '../../../../components/automod/RegexTester';
import {
  ShieldAlert,
  Save,
  CheckCircle2,
  Lock,
  Link2,
  Scan,
  Users,
  Eye,
  AlertTriangle,
} from 'lucide-react';

export default function AutoModShieldsPage() {
  const [savedToast, setSavedToast] = useState(false);
  const [blockInvites, setBlockInvites] = useState(true);
  const [blockPhishing, setBlockPhishing] = useState(true);
  const [mentionLimit, setMentionLimit] = useState(5);
  const [ocrScanner, setOcrScanner] = useState(true);
  const [whitelistChannels, setWhitelistChannels] = useState('#partners, #advertising');

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
              <ShieldAlert className="h-7 w-7 text-indigo-400" />
              <span>AutoMod Shields & Heuristic Scanner</span>
            </h1>
            <span className="rounded-full bg-indigo-500/10 px-2.5 py-0.5 text-xs font-semibold text-indigo-400 border border-indigo-500/20">
              Native Filtering
            </span>
          </div>
          <p className="mt-1 text-sm text-neutral-400">
            Enforce Discord Native AutoMod rules, anti-phishing threat intelligence, and mass-mention spam protection.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2.5 text-xs font-bold text-white shadow-glow-indigo hover:from-indigo-500 hover:to-purple-500 transition active:scale-95 self-start sm:self-auto"
        >
          <Save className="h-4 w-4" />
          <span>Save AutoMod Rules</span>
        </button>
      </div>

      {savedToast && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs text-emerald-300 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>AutoMod rule set pushed to Discord REST Gateway and Cluster.</span>
          </div>
          <span className="font-mono text-[10px] text-emerald-400">DEPLOYED</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Protection Shields */}
        <section className="glass-panel rounded-2xl p-6 space-y-5">
          <h2 className="text-base font-bold text-white flex items-center gap-2 pb-3 border-b border-white/5">
            <Lock className="h-4 w-4 text-indigo-400" />
            <span>Active Automated Filters</span>
          </h2>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-space-850/60 border border-white/5">
              <div>
                <span className="text-xs font-semibold text-white block">Discord Invite Link Shield</span>
                <span className="text-[11px] text-neutral-400 block">Blocks external discord.gg / discord.com/invite links</span>
              </div>
              <button
                onClick={() => setBlockInvites(!blockInvites)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                  blockInvites ? 'bg-indigo-600' : 'bg-neutral-800'
                }`}
              >
                <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${blockInvites ? 'translate-x-4' : 'translate-x-1'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-space-850/60 border border-white/5">
              <div>
                <span className="text-xs font-semibold text-white block">Anti-Phishing & Credential Guard</span>
                <span className="text-[11px] text-neutral-400 block">Blocks 25,400+ known fake Nitro scams and token stealers</span>
              </div>
              <button
                onClick={() => setBlockPhishing(!blockPhishing)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                  blockPhishing ? 'bg-indigo-600' : 'bg-neutral-800'
                }`}
              >
                <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${blockPhishing ? 'translate-x-4' : 'translate-x-1'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-space-850/60 border border-white/5">
              <div>
                <span className="text-xs font-semibold text-white block">Attachment OCR Scanner</span>
                <span className="text-[11px] text-neutral-400 block">Extracts text from screenshots to block graphic QR code phishing</span>
              </div>
              <button
                onClick={() => setOcrScanner(!ocrScanner)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                  ocrScanner ? 'bg-indigo-600' : 'bg-neutral-800'
                }`}
              >
                <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${ocrScanner ? 'translate-x-4' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs text-neutral-300 mb-2">
              <span>Max Mentions Threshold</span>
              <span className="font-mono text-indigo-400 font-bold">{mentionLimit} mentions / message</span>
            </div>
            <input
              type="range"
              min="2"
              max="20"
              value={mentionLimit}
              onChange={(e) => setMentionLimit(Number(e.target.value))}
              className="w-full accent-indigo-500 h-1.5 bg-space-800 rounded-lg cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
              Whitelisted Exemption Channels
            </label>
            <input
              type="text"
              value={whitelistChannels}
              onChange={(e) => setWhitelistChannels(e.target.value)}
              className="w-full rounded-xl border border-neutral-800 bg-space-950 px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:border-indigo-500 focus:outline-none"
            />
            <span className="text-[11px] text-neutral-500 mt-1 block">
              Channels where links and invites are permitted without automatic deletion.
            </span>
          </div>
        </section>

        {/* Heuristics Simulator */}
        <section className="space-y-4">
          <RegexTester />
        </section>
      </div>
    </div>
  );
}
