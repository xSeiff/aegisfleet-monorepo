'use client';

import React, { useState } from 'react';

interface ClusterMetric {
  clusterId: number;
  shards: number[];
  ramUsage: number;
  guildCount: number;
  ping: number;
  lastSeen: number;
}

export function ShardMonitor() {
  const [clusters] = useState<ClusterMetric[]>([
    { clusterId: 0, shards: [0, 1, 2, 3], ramUsage: 184, guildCount: 1240, ping: 22, lastSeen: Date.now() },
    { clusterId: 1, shards: [4, 5, 6, 7], ramUsage: 196, guildCount: 1312, ping: 24, lastSeen: Date.now() },
  ]);

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-6 backdrop-blur">
      <div className="grid grid-cols-2 gap-4 mb-6 sm:grid-cols-4">
        <div className="rounded-lg bg-neutral-950 p-4 border border-neutral-800">
          <span className="text-xs text-neutral-400 uppercase">Active Clusters</span>
          <p className="text-2xl font-bold text-white mt-1">{clusters.length}</p>
        </div>
        <div className="rounded-lg bg-neutral-950 p-4 border border-neutral-800">
          <span className="text-xs text-neutral-400 uppercase">Total Shards</span>
          <p className="text-2xl font-bold text-indigo-400 mt-1">{clusters.reduce((acc, c) => acc + c.shards.length, 0)}</p>
        </div>
        <div className="rounded-lg bg-neutral-950 p-4 border border-neutral-800">
          <span className="text-xs text-neutral-400 uppercase">Total Guilds</span>
          <p className="text-2xl font-bold text-emerald-400 mt-1">{clusters.reduce((acc, c) => acc + c.guildCount, 0)}</p>
        </div>
        <div className="rounded-lg bg-neutral-950 p-4 border border-neutral-800">
          <span className="text-xs text-neutral-400 uppercase">Avg Gateway Ping</span>
          <p className="text-2xl font-bold text-amber-400 mt-1">23 ms</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-neutral-800">
        <table className="w-full text-left text-sm text-neutral-300">
          <thead className="bg-neutral-950 text-xs uppercase text-neutral-400">
            <tr>
              <th className="px-4 py-3">Cluster ID</th>
              <th className="px-4 py-3">Shards</th>
              <th className="px-4 py-3">RAM</th>
              <th className="px-4 py-3">Guilds</th>
              <th className="px-4 py-3">Gateway Ping</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800 font-mono text-xs">
            {clusters.map((c) => (
              <tr key={c.clusterId} className="hover:bg-neutral-800/40">
                <td className="px-4 py-3 font-semibold text-white">Cluster #{c.clusterId}</td>
                <td className="px-4 py-3 text-neutral-400">[{c.shards.join(', ')}]</td>
                <td className="px-4 py-3">{c.ramUsage} MB</td>
                <td className="px-4 py-3 text-emerald-400">{c.guildCount}</td>
                <td className="px-4 py-3 text-amber-400">{c.ping} ms</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
