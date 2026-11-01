'use client';

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { DiscordAuthModal } from './DiscordAuthModal';
import Link from 'next/link';
import {
  ShieldAlert,
  Lock,
  UserCheck,
  ArrowLeft,
  KeyRound,
  AlertTriangle,
} from 'lucide-react';

interface PermissionGuardProps {
  guildId: string;
  children: React.ReactNode;
}

export function PermissionGuard({ guildId, children }: PermissionGuardProps) {
  const { user, hasPermissionForGuild, isLoading } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  // 1. Not Authenticated
  if (!user) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center p-6">
        <div className="max-w-md space-y-5 rounded-3xl border border-white/10 bg-space-900/90 p-8 shadow-2xl backdrop-blur-2xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
            <Lock className="h-8 w-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Authentication Required
            </h2>
            <p className="text-xs text-neutral-400 leading-relaxed">
              You must verify your Discord account to see your servers and manage Galaxy Bot settings for Server <span className="font-mono text-indigo-400 font-semibold">{guildId}</span>.
            </p>
          </div>

          <button
            onClick={() => setModalOpen(true)}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 text-xs font-bold text-white shadow-glow-indigo hover:from-indigo-500 hover:to-purple-500 transition active:scale-95"
          >
            <UserCheck className="h-4 w-4" />
            <span>Verify with Discord</span>
          </button>

          <Link
            href="/dashboard"
            className="block text-xs text-neutral-500 hover:text-neutral-300 transition"
          >
            ← Return to Server Selection Hub
          </Link>
        </div>

        <DiscordAuthModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
      </div>
    );
  }

  // 2. Authenticated but lacks Administrator / Manage Guild permission
  const hasPerm = hasPermissionForGuild(guildId);
  if (!hasPerm) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center p-6">
        <div className="max-w-md space-y-5 rounded-3xl border border-red-500/20 bg-space-900/90 p-8 shadow-2xl backdrop-blur-2xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 text-red-400 border border-red-500/30">
            <ShieldAlert className="h-8 w-8" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 px-3 py-1 text-[11px] font-bold text-red-400 border border-red-500/20">
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>403 Forbidden • Insufficient Permissions</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight pt-1">
              Administrator Rights Required
            </h2>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Your account (<span className="text-white font-semibold">{user.username}#{user.discriminator}</span>) does not possess the <strong className="text-red-400 font-mono">ADMINISTRATOR (0x8)</strong> or <strong className="text-red-400 font-mono">MANAGE_GUILD (0x20)</strong> permission in Server <span className="font-mono text-indigo-400 font-semibold">{guildId}</span>.
            </p>
          </div>

          <div className="rounded-xl border border-white/5 bg-space-950 p-4 text-left text-xs text-neutral-400 space-y-1">
            <span className="font-semibold text-neutral-300 block text-[11px] uppercase">
              How to resolve:
            </span>
            <p>1. Ask the server owner to grant your role the Administrator permission.</p>
            <p>2. Or switch to a verified Discord account that has server ownership.</p>
          </div>

          <div className="space-y-2 pt-2">
            <button
              onClick={() => setModalOpen(true)}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-neutral-700 bg-space-850 px-4 py-2.5 text-xs font-semibold text-white hover:bg-space-800 transition"
            >
              <KeyRound className="h-4 w-4 text-indigo-400" />
              <span>Switch Account / Verify as Admin</span>
            </button>

            <Link
              href="/dashboard"
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-indigo-500 transition"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to My Servers</span>
            </Link>
          </div>
        </div>

        <DiscordAuthModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
      </div>
    );
  }

  // 3. User is verified and has Administrator permissions
  return <>{children}</>;
}
