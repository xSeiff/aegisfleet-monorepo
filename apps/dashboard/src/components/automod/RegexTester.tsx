'use client';

import React, { useState, useTransition } from 'react';

export function RegexTester() {
  const [pattern, setPattern] = useState('');
  const [sampleText, setSampleText] = useState('');
  const [matches, setMatches] = useState<boolean | null>(null);
  const [execTimeMs, setExecTimeMs] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();

  const runTest = () => {
    startTransition(() => {
      try {
        const start = performance.now();
        const regex = new RegExp(pattern, 'i');
        const isMatch = regex.test(sampleText);
        const end = performance.now();

        setMatches(isMatch);
        setExecTimeMs(Number((end - start).toFixed(4)));
      } catch (err) {
        setMatches(null);
        setExecTimeMs(null);
      }
    });
  };

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-6 text-white backdrop-blur">
      <h3 className="text-lg font-semibold tracking-tight">AutoMod Visual Regex Tester</h3>
      <p className="text-sm text-neutral-400 mb-4">
        Validate high-throughput regular expressions against phishing, token theft, and spam patterns.
      </p>

      <div className="space-y-4">
        <div>
          <label className="block text-xs uppercase tracking-wider text-neutral-400 mb-1">Regex Pattern</label>
          <input
            type="text"
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            placeholder="e.g. (discord\.gg\/[a-zA-Z0-9]+|nitro)"
            className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm font-mono text-emerald-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider text-neutral-400 mb-1">Sample Message Payload</label>
          <textarea
            value={sampleText}
            onChange={(e) => setSampleText(e.target.value)}
            rows={3}
            placeholder="Paste text here to evaluate..."
            className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <button
          onClick={runTest}
          disabled={isPending || !pattern}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium transition hover:bg-indigo-500 disabled:opacity-50"
        >
          {isPending ? 'Testing...' : 'Execute Matcher'}
        </button>

        {matches !== null && (
          <div className={`mt-4 rounded-lg p-3 text-sm flex items-center justify-between ${matches ? 'bg-red-950/40 border border-red-800 text-red-300' : 'bg-emerald-950/40 border border-emerald-800 text-emerald-300'}`}>
            <span>{matches ? '⚠️ Pattern Matched (Blocked)' : '✅ Pattern Clean (Allowed)'}</span>
            {execTimeMs !== null && <span className="font-mono text-xs opacity-75">{execTimeMs} ms</span>}
          </div>
        )}
      </div>
    </div>
  );
}
