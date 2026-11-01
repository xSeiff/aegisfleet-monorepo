'use client';

import React, { useState } from 'react';
import {
  Ticket,
  Save,
  CheckCircle2,
  Sparkles,
  MessageSquare,
  FileText,
  Star,
  Users,
  Eye,
} from 'lucide-react';

export default function TicketStudioDashboardPage() {
  const [savedToast, setSavedToast] = useState(false);
  const [panelTitle, setPanelTitle] = useState('Galaxy Bot Support & Help Desk');
  const [panelDescription, setPanelDescription] = useState('Need assistance with our server or services? Open a ticket below to get connected with our support team.');
  const [ticketPrefix, setTicketPrefix] = useState('ticket');
  const [claimRequired, setClaimRequired] = useState(true);
  const [htmlTranscripts, setHtmlTranscripts] = useState(true);
  const [csatEnabled, setCsatEnabled] = useState(true);
  const [colorHex, setColorHex] = useState('#6366f1');

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
              <Ticket className="h-7 w-7 text-indigo-400" />
              <span>Ticket Support Studio</span>
            </h1>
            <span className="rounded-full bg-indigo-500/10 px-2.5 py-0.5 text-xs font-semibold text-indigo-400 border border-indigo-500/20">
              Interactive Dispatcher
            </span>
          </div>
          <p className="mt-1 text-sm text-neutral-400">
            Design interactive embed dispatchers, configure modal intake forms, staff claim routing, and standalone HTML transcripts.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2.5 text-xs font-bold text-white shadow-glow-indigo hover:from-indigo-500 hover:to-purple-500 transition active:scale-95 self-start sm:self-auto"
        >
          <Save className="h-4 w-4" />
          <span>Save & Deploy Panel</span>
        </button>
      </div>

      {savedToast && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs text-emerald-300 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>Ticket panel published and active on Discord Gateway.</span>
          </div>
          <span className="font-mono text-[10px] text-emerald-400">PUBLISHED</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Panel Configurator */}
        <div className="glass-panel rounded-2xl p-6 space-y-5">
          <h2 className="text-base font-bold text-white flex items-center gap-2 pb-3 border-b border-white/5">
            <MessageSquare className="h-4 w-4 text-indigo-400" />
            <span>Panel Settings & Questions</span>
          </h2>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
              Panel Embed Title
            </label>
            <input
              type="text"
              value={panelTitle}
              onChange={(e) => setPanelTitle(e.target.value)}
              className="w-full rounded-xl border border-neutral-800 bg-space-950 px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
              Embed Description
            </label>
            <textarea
              rows={3}
              value={panelDescription}
              onChange={(e) => setPanelDescription(e.target.value)}
              className="w-full rounded-xl border border-neutral-800 bg-space-950 px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                Channel Name Prefix
              </label>
              <input
                type="text"
                value={ticketPrefix}
                onChange={(e) => setTicketPrefix(e.target.value)}
                className="w-full rounded-xl border border-neutral-800 bg-space-950 px-3.5 py-2.5 text-xs font-mono text-indigo-400 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                Theme Hex Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={colorHex}
                  onChange={(e) => setColorHex(e.target.value)}
                  className="h-9 w-9 rounded-lg border border-neutral-800 bg-space-950 cursor-pointer p-0.5"
                />
                <input
                  type="text"
                  value={colorHex}
                  onChange={(e) => setColorHex(e.target.value)}
                  className="flex-1 rounded-xl border border-neutral-800 bg-space-950 px-3 py-2 text-xs font-mono text-white"
                />
              </div>
            </div>
          </div>

          {/* Feature toggles */}
          <div className="pt-3 border-t border-white/5 space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-space-850/60 border border-white/5">
              <div>
                <span className="text-xs font-semibold text-white block">Staff Ticket Claiming</span>
                <span className="text-[11px] text-neutral-400 block">Require staff to claim tickets before replying</span>
              </div>
              <button
                onClick={() => setClaimRequired(!claimRequired)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                  claimRequired ? 'bg-indigo-600' : 'bg-neutral-800'
                }`}
              >
                <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${claimRequired ? 'translate-x-4' : 'translate-x-1'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-space-850/60 border border-white/5">
              <div>
                <span className="text-xs font-semibold text-white block">HTML Transcripts</span>
                <span className="text-[11px] text-neutral-400 block">Generate standalone dark-mode HTML transcripts upon close</span>
              </div>
              <button
                onClick={() => setHtmlTranscripts(!htmlTranscripts)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                  htmlTranscripts ? 'bg-indigo-600' : 'bg-neutral-800'
                }`}
              >
                <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${htmlTranscripts ? 'translate-x-4' : 'translate-x-1'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-space-850/60 border border-white/5">
              <div>
                <span className="text-xs font-semibold text-white block">CSAT Satisfaction Surveys</span>
                <span className="text-[11px] text-neutral-400 block">Prompt members to rate support 1-5 stars after resolution</span>
              </div>
              <button
                onClick={() => setCsatEnabled(!csatEnabled)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                  csatEnabled ? 'bg-indigo-600' : 'bg-neutral-800'
                }`}
              >
                <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${csatEnabled ? 'translate-x-4' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Live Discord Embed Preview */}
        <div className="glass-panel rounded-2xl p-6 space-y-4 flex flex-col">
          <h2 className="text-base font-bold text-white flex items-center gap-2 pb-3 border-b border-white/5">
            <Eye className="h-4 w-4 text-purple-400" />
            <span>Real-Time Discord Client Preview</span>
          </h2>

          <div className="flex-1 rounded-2xl border border-white/10 bg-[#313338] p-5 shadow-2xl flex flex-col justify-center">
            <div className="flex items-center gap-2 pb-3 mb-3 border-b border-white/5">
              <span className="text-xs font-mono text-neutral-400">#support-tickets</span>
            </div>

            <div className="flex items-start gap-3">
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-xs shrink-0">
                GB
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white text-xs">Galaxy Bot</span>
                  <span className="rounded bg-[#5865F2] px-1 py-0.2 text-[9px] font-bold text-white uppercase">
                    BOT
                  </span>
                  <span className="text-[10px] text-neutral-400">Today at 2:30 PM</span>
                </div>

                {/* Discord Embed */}
                <div
                  className="mt-2.5 rounded-lg bg-[#2b2d31] p-4 text-xs space-y-2 border-l-4"
                  style={{ borderLeftColor: colorHex }}
                >
                  <h3 className="font-bold text-white text-sm">{panelTitle}</h3>
                  <p className="text-neutral-300 leading-relaxed text-xs">
                    {panelDescription}
                  </p>
                  <div className="pt-2 flex items-center gap-2 text-[11px] text-neutral-400">
                    <span className="text-emerald-400 font-semibold">• Direct Staff Dispatch</span>
                  </div>
                </div>

                {/* Buttons */}
                <div className="mt-3 flex flex-wrap gap-2">
                  <button className="flex items-center gap-1.5 rounded bg-[#5865F2] hover:bg-[#4752C4] px-3 py-1.5 text-xs font-medium text-white transition">
                    <span>📩</span>
                    <span>Open Ticket</span>
                  </button>
                  <button className="flex items-center gap-1.5 rounded bg-[#4e5058] hover:bg-[#6d6f78] px-3 py-1.5 text-xs font-medium text-white transition">
                    <span>📋</span>
                    <span>Support Guidelines</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
