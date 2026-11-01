'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { DiscordAuthModal } from '../auth/DiscordAuthModal';
import {
  Shield,
  Sparkles,
  ExternalLink,
  Lock,
  UserCheck,
  ChevronDown,
} from 'lucide-react';

export function DashboardNavbar() {
  const { user } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-white/5 bg-space-950/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-purple-600 to-cyan-500 shadow-glow-indigo transition-transform group-hover:scale-105">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold tracking-tight text-white group-hover:text-indigo-300 transition-colors">
                  Galaxy Bot
                </span>
                <span className="rounded-md bg-indigo-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-400 border border-indigo-500/20">
                  v2026.1
                </span>
              </div>
              <p className="text-[11px] text-neutral-400">
                By <span className="text-indigo-400 font-medium">xSeif</span>
              </p>
            </div>
          </Link>

          {/* Status indicator */}
          <div className="hidden md:flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-3 py-1 text-xs text-emerald-400">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
            </span>
            <span>All 12 Modules Operational • Shard 0 Online</span>
          </div>

          {/* Action CTAs & User Profile */}
          <div className="flex items-center gap-3">
            <a
              href="https://github.com/xSeiff"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-neutral-800 bg-space-850 px-3 py-1.5 text-xs font-medium text-neutral-300 hover:border-neutral-700 hover:text-white transition"
            >
              <span>GitHub</span>
              <ExternalLink className="h-3 w-3 text-neutral-400" />
            </a>

            {/* Discord Verification Pill */}
            {user ? (
              <button
                onClick={() => setModalOpen(true)}
                className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-space-850/80 px-3 py-1.5 hover:border-indigo-500/40 hover:bg-space-800 transition"
              >
                <div className="h-6 w-6 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <div className="text-left hidden sm:block">
                  <span className="text-xs font-semibold text-white block leading-none">
                    {user.username}
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono leading-none">
                    {user.isOwner ? '⭐ Bot Owner' : user.isAdmin ? 'Admin' : 'Member'}
                  </span>
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-neutral-400" />
              </button>
            ) : (
              <button
                onClick={() => setModalOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-3.5 py-1.5 text-xs font-semibold text-indigo-300 hover:bg-indigo-500/20 transition"
              >
                <Lock className="h-3.5 w-3.5" />
                <span>Verify with Discord</span>
              </button>
            )}

            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 text-xs font-semibold text-white shadow-glow-indigo hover:from-indigo-500 hover:to-purple-500 transition-all active:scale-95"
            >
              <Shield className="h-3.5 w-3.5" />
              <span>Servers</span>
            </Link>
          </div>
        </div>
      </header>

      <DiscordAuthModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
