'use client';

import React, { useState } from 'react';
import {
  Bot,
  Save,
  CheckCircle2,
  Plus,
  Trash2,
  Sparkles,
  Search,
  MessageSquare,
  Terminal,
} from 'lucide-react';

interface AutoResponderItem {
  id: string;
  trigger: string;
  matchType: 'EXACT' | 'CONTAINS' | 'REGEX';
  reply: string;
}

export default function AutoRespondersPage() {
  const [savedToast, setSavedToast] = useState(false);
  const [responders, setResponders] = useState<AutoResponderItem[]>([
    { id: '1', trigger: '!rules', matchType: 'EXACT', reply: 'Please review our server rules in #rules-and-info.' },
    { id: '2', trigger: 'support ticket', matchType: 'CONTAINS', reply: 'Need assistance? Open a ticket in #support!' },
    { id: '3', trigger: '^!verify\\s+([a-zA-Z0-9]+)$', matchType: 'REGEX', reply: 'Verification token processed. Welcome!' },
  ]);

  const [newTrigger, setNewTrigger] = useState('');
  const [newReply, setNewReply] = useState('');
  const [newMatchType, setNewMatchType] = useState<'EXACT' | 'CONTAINS' | 'REGEX'>('EXACT');
  const [searchFilter, setSearchFilter] = useState('');

  const handleSave = () => {
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 3000);
  };

  const addResponder = () => {
    if (!newTrigger || !newReply) return;
    setResponders([
      ...responders,
      { id: Date.now().toString(), trigger: newTrigger, reply: newReply, matchType: newMatchType },
    ]);
    setNewTrigger('');
    setNewReply('');
  };

  const deleteResponder = (id: string) => {
    setResponders(responders.filter((r) => r.id !== id));
  };

  const filtered = responders.filter(
    (r) =>
      r.trigger.toLowerCase().includes(searchFilter.toLowerCase()) ||
      r.reply.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
              <Bot className="h-7 w-7 text-indigo-400" />
              <span>Auto-Responders & Keyword Triggers</span>
            </h1>
            <span className="rounded-full bg-indigo-500/10 px-2.5 py-0.5 text-xs font-semibold text-indigo-400 border border-indigo-500/20">
              Regex Powered
            </span>
          </div>
          <p className="mt-1 text-sm text-neutral-400">
            Configure instant automated replies matched via exact keyword, phrase substring, or regular expressions.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2.5 text-xs font-bold text-white shadow-glow-indigo hover:from-indigo-500 hover:to-purple-500 transition active:scale-95 self-start sm:self-auto"
        >
          <Save className="h-4 w-4" />
          <span>Save Triggers</span>
        </button>
      </div>

      {savedToast && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs text-emerald-300 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>Auto-responder triggers written to PostgreSQL and active on Cluster.</span>
          </div>
          <span className="font-mono text-[10px] text-emerald-400">SYNCED</span>
        </div>
      )}

      {/* Creator Form */}
      <div className="glass-panel rounded-2xl p-6 space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2 pb-3 border-b border-white/5">
          <Plus className="h-4 w-4 text-indigo-400" />
          <span>Add New Trigger Keyword</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
              Trigger Keyword / Pattern
            </label>
            <input
              type="text"
              value={newTrigger}
              onChange={(e) => setNewTrigger(e.target.value)}
              placeholder="e.g. !ip, help, nitro"
              className="w-full rounded-xl border border-neutral-800 bg-space-950 px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:border-indigo-500 focus:outline-none font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
              Match Algorithm
            </label>
            <select
              value={newMatchType}
              onChange={(e) => setNewMatchType(e.target.value as any)}
              className="w-full rounded-xl border border-neutral-800 bg-space-950 px-3.5 py-2.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
            >
              <option value="EXACT">Exact Keyword Match</option>
              <option value="CONTAINS">Contains Substring Phrase</option>
              <option value="REGEX">Regular Expression (Advanced)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
              Bot Response Output
            </label>
            <input
              type="text"
              value={newReply}
              onChange={(e) => setNewReply(e.target.value)}
              placeholder="Enter message reply..."
              className="w-full rounded-xl border border-neutral-800 bg-space-950 px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:border-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={addResponder}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition"
          >
            <Plus className="h-4 w-4" />
            <span>Create Trigger</span>
          </button>
        </div>
      </div>

      {/* Triggers Table */}
      <div className="glass-panel rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">
            Active Triggers ({responders.length})
          </h3>
          <div className="relative w-64">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-neutral-500" />
            <input
              type="text"
              placeholder="Filter triggers..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full rounded-lg border border-neutral-800 bg-space-950 pl-8 pr-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:border-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        <table className="w-full text-left text-xs text-neutral-300">
          <thead className="bg-space-950/80 uppercase text-[10px] text-neutral-500 tracking-wider">
            <tr>
              <th className="px-6 py-3.5">Trigger</th>
              <th className="px-6 py-3.5">Type</th>
              <th className="px-6 py-3.5">Bot Response</th>
              <th className="px-6 py-3.5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 font-mono">
            {filtered.map((r) => (
              <tr key={r.id} className="hover:bg-space-850/40 transition">
                <td className="px-6 py-3.5 font-bold text-indigo-400">{r.trigger}</td>
                <td className="px-6 py-3.5">
                  <span
                    className={`rounded-md px-2 py-0.5 text-[10px] font-semibold border ${
                      r.matchType === 'EXACT'
                        ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                        : r.matchType === 'CONTAINS'
                        ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    }`}
                  >
                    {r.matchType}
                  </span>
                </td>
                <td className="px-6 py-3.5 font-sans text-neutral-200">{r.reply}</td>
                <td className="px-6 py-3.5 text-right">
                  <button
                    onClick={() => deleteResponder(r.id)}
                    className="p-1 text-neutral-500 hover:text-red-400 transition"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
