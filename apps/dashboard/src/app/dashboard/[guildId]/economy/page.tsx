'use client';

import React, { useState } from 'react';
import {
  Coins,
  Save,
  CheckCircle2,
  TrendingUp,
  Dices,
  Percent,
  Shield,
  Sparkles,
} from 'lucide-react';

export default function EconomyDashboardPage() {
  const [savedToast, setSavedToast] = useState(false);
  const [currencySymbol, setCurrencySymbol] = useState('🪙');
  const [currencyName, setCurrencyName] = useState('Credits');
  const [dailyAmount, setDailyAmount] = useState(500);
  const [transferTax, setTransferTax] = useState(5);
  const [gamblingEnabled, setGamblingEnabled] = useState(true);
  const [robberyEnabled, setRobberyEnabled] = useState(false);

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
              <Coins className="h-7 w-7 text-amber-400" />
              <span>Virtual Economy & Casino</span>
            </h1>
            <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-400 border border-amber-500/20">
              Provably-Fair
            </span>
          </div>
          <p className="mt-1 text-sm text-neutral-400">
            Configure server currency, daily dividends, transfer transaction tax, and casino mini-games.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2.5 text-xs font-bold text-white shadow-glow-indigo hover:from-indigo-500 hover:to-purple-500 transition active:scale-95 self-start sm:self-auto"
        >
          <Save className="h-4 w-4" />
          <span>Save Economy Settings</span>
        </button>
      </div>

      {savedToast && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs text-emerald-300 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>Economy rules saved to PostgreSQL database.</span>
          </div>
          <span className="font-mono text-[10px] text-emerald-400">SAVED</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Treasury & Dividends */}
        <section className="glass-panel rounded-2xl p-6 space-y-5">
          <h2 className="text-base font-bold text-white flex items-center gap-2 pb-3 border-b border-white/5">
            <Coins className="h-4 w-4 text-amber-400" />
            <span>Treasury & Dividends</span>
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Currency Symbol</label>
              <input
                type="text"
                value={currencySymbol}
                onChange={(e) => setCurrencySymbol(e.target.value)}
                className="w-full rounded-xl border border-neutral-800 bg-space-950 px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">Currency Name</label>
              <input
                type="text"
                value={currencyName}
                onChange={(e) => setCurrencyName(e.target.value)}
                className="w-full rounded-xl border border-neutral-800 bg-space-950 px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
              Daily Dividend Claim Amount
            </label>
            <input
              type="number"
              value={dailyAmount}
              onChange={(e) => setDailyAmount(Number(e.target.value))}
              className="w-full rounded-xl border border-neutral-800 bg-space-950 px-3.5 py-2.5 text-xs font-mono text-amber-400 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs text-neutral-300 mb-2">
              <span>Transfer Transaction Tax</span>
              <span className="font-mono text-indigo-400 font-bold">{transferTax}% (Deposited to Guild Treasury)</span>
            </div>
            <input
              type="range"
              min="0"
              max="25"
              value={transferTax}
              onChange={(e) => setTransferTax(Number(e.target.value))}
              className="w-full accent-indigo-500 h-1.5 bg-space-800 rounded-lg cursor-pointer"
            />
          </div>

          <div className="pt-3 border-t border-white/5 flex items-center justify-between p-3 rounded-xl bg-space-850/60 border border-white/5">
            <div>
              <span className="text-xs font-semibold text-white block">Robbery & Heists</span>
              <span className="text-[11px] text-neutral-400 block">Allows members to attempt risky balance heists against other users</span>
            </div>
            <button
              onClick={() => setRobberyEnabled(!robberyEnabled)}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                robberyEnabled ? 'bg-indigo-600' : 'bg-neutral-800'
              }`}
            >
              <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${robberyEnabled ? 'translate-x-4' : 'translate-x-1'}`} />
            </button>
          </div>
        </section>

        {/* Casino & Mini-Games */}
        <section className="glass-panel rounded-2xl p-6 space-y-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Dices className="h-4 w-4 text-purple-400" />
                <span>Provably-Fair Casino Suite</span>
              </h2>

              <button
                onClick={() => setGamblingEnabled(!gamblingEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  gamblingEnabled ? 'bg-purple-600' : 'bg-neutral-800'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${gamblingEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            <div className="mt-4 rounded-xl border border-white/5 bg-space-950 p-4 space-y-2.5">
              <h3 className="text-xs uppercase text-neutral-400 font-bold">House Payout Rules</h3>
              <div className="space-y-1.5 text-xs text-neutral-300">
                <div className="flex justify-between">
                  <span>🪙 Coinflip</span>
                  <span className="text-emerald-400 font-mono">50.0% Win (2.0x Payout)</span>
                </div>
                <div className="flex justify-between">
                  <span>🎰 Slots (7️⃣ 7️⃣ 7️⃣ Jackpot)</span>
                  <span className="text-amber-400 font-mono">10.0x Payout</span>
                </div>
                <div className="flex justify-between">
                  <span>💎 Slots (💎 💎 💎 Diamonds)</span>
                  <span className="text-cyan-400 font-mono">5.0x Payout</span>
                </div>
                <div className="flex justify-between">
                  <span>🍒 Slots (🍒 🍒 🍒 Cherries)</span>
                  <span className="text-purple-400 font-mono">3.0x Payout</span>
                </div>
              </div>
            </div>
          </div>

          {/* Discord Wallet Preview */}
          <div className="mt-4 rounded-xl border border-white/10 bg-[#313338] p-4 text-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-white">Discord Balance Preview</span>
              <span className="text-[10px] text-neutral-400 font-mono">/galaxy casino balance</span>
            </div>
            <div className="rounded-lg bg-[#2b2d31] border-l-4 border-amber-500 p-3">
              <span className="text-white font-semibold text-xs">Astronaut's Wallet</span>
              <p className="text-amber-400 font-mono text-base font-bold mt-1">
                {currencySymbol} 12,500 {currencyName}
              </p>
              <span className="text-[10px] text-neutral-400 block mt-1">Daily Claimed: Today at 00:00 UTC</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
