'use client';

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Shield,
  Lock,
  CheckCircle2,
  X,
  ExternalLink,
  KeyRound,
  UserCheck,
  AlertTriangle,
  Sparkles,
  Loader2,
} from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DISCORD_CLIENT_ID = '1355035089121316904';
const DISCORD_REDIRECT_URI = 'http://localhost:3000/api/auth/callback/discord';
const DISCORD_OAUTH_URL = `https://discord.com/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(
  DISCORD_REDIRECT_URI
)}&response_type=token&scope=identify%20guilds`;

export function DiscordAuthModal({ isOpen, onClose }: ModalProps) {
  const { user, loginWithToken, loginAsOwner, loginAsMember, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'oauth' | 'token' | 'quick'>('oauth');
  const [tokenInput, setTokenInput] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleManualTokenSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenInput.trim()) return;
    setIsVerifying(true);
    setErrorMsg('');

    const res = await loginWithToken(tokenInput.trim());
    setIsVerifying(false);
    if (res.success) {
      onClose();
    } else {
      setErrorMsg(res.error || 'Failed to verify token with Discord');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg rounded-3xl border border-white/10 bg-space-900 p-6 shadow-2xl space-y-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-xl text-neutral-400 hover:text-white hover:bg-space-800 transition"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Discord Verification Header */}
        <div className="flex items-center gap-3.5">
          <div className="h-12 w-12 rounded-2xl bg-[#5865F2] flex items-center justify-center text-white font-black text-xl shadow-glow-indigo">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Discord Verification Gate
            </h2>
            <p className="text-xs text-neutral-400">
              Galaxy Bot • Identity & Bitwise Permission Validation
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex rounded-xl bg-space-950 p-1 border border-white/5 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('oauth')}
            className={`flex-1 py-2 rounded-lg transition ${
              activeTab === 'oauth'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Discord OAuth2
          </button>
          <button
            onClick={() => setActiveTab('token')}
            className={`flex-1 py-2 rounded-lg transition ${
              activeTab === 'token'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Direct Token
          </button>
          <button
            onClick={() => setActiveTab('quick')}
            className={`flex-1 py-2 rounded-lg transition ${
              activeTab === 'quick'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Test Accounts
          </button>
        </div>

        {/* Tab 1: Real Discord OAuth2 */}
        {activeTab === 'oauth' && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-white/5 bg-space-950 p-4 space-y-2.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block">
                Official Discord Authorization:
              </span>
              <ul className="space-y-2 text-xs text-neutral-300">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>
                    <strong className="text-white font-mono">identify</strong> — Access your Discord username, avatar, and ID
                  </span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>
                    <strong className="text-white font-mono">guilds</strong> — Fetch real servers you are a member of
                  </span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-indigo-400 shrink-0" />
                  <span>
                    <strong className="text-white font-mono">0x8 / 0x20 check</strong> — Evaluates Administrator and Manage Guild rights
                  </span>
                </li>
              </ul>
            </div>

            <a
              href={DISCORD_OAUTH_URL}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] px-4 py-3 text-xs font-bold text-white shadow-glow-indigo transition active:scale-95"
            >
              <Shield className="h-4 w-4" />
              <span>Authorize with Discord (OAuth2)</span>
              <ExternalLink className="h-3.5 w-3.5 opacity-70" />
            </a>

            <div className="p-3 rounded-xl border border-neutral-800 bg-space-950/60 text-[11px] text-neutral-400">
              💡 <em>Note:</em> Requires <code className="text-indigo-300">http://localhost:3000/api/auth/callback/discord</code> configured in Discord Developer Portal redirects. If not yet added, use the <strong>Direct Token</strong> or <strong>Test Accounts</strong> tab.
            </div>
          </div>
        )}

        {/* Tab 2: Direct Token / Manual Auth */}
        {activeTab === 'token' && (
          <form onSubmit={handleManualTokenSubmit} className="space-y-4">
            <div className="rounded-2xl border border-white/5 bg-space-950 p-4 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block">
                Direct Discord Token Verification:
              </span>
              <p className="text-xs text-neutral-300">
                Instantly queries Discord API (<code className="text-indigo-400">/users/@me</code> & <code className="text-indigo-400">/users/@me/guilds</code>) with your token and verifies Administrator rights.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-neutral-300 block">
                Discord Token (OAuth2 Access Token or User Token)
              </label>
              <input
                type="password"
                placeholder="Paste token here..."
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                className="w-full rounded-xl border border-neutral-800 bg-space-950 px-4 py-3 text-xs text-white placeholder-neutral-500 focus:border-indigo-500 focus:outline-none font-mono"
              />
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl border border-rose-500/20 bg-rose-500/10 text-xs text-rose-400 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isVerifying || !tokenInput.trim()}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 px-4 py-3 text-xs font-bold text-white shadow-glow-indigo transition"
            >
              {isVerifying ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Validating Permissions with Discord...</span>
                </>
              ) : (
                <>
                  <KeyRound className="h-4 w-4" />
                  <span>Verify and Fetch My Servers</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* Tab 3: Quick Test Accounts */}
        {activeTab === 'quick' && (
          <div className="space-y-3">
            <div className="rounded-2xl border border-white/5 bg-space-950 p-4 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block">
                Fast Role Testing:
              </span>
              <p className="text-xs text-neutral-300">
                Immediately test how Galaxy Bot handles full Administrator permissions vs. non-administrative restricted accounts across your real Discord servers.
              </p>
            </div>

            <button
              onClick={async () => {
                await loginAsOwner();
                onClose();
              }}
              className="w-full flex items-center justify-between rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3 text-xs font-bold text-white shadow-glow-indigo hover:from-indigo-500 hover:to-purple-500 transition"
            >
              <div className="flex items-center gap-2">
                <UserCheck className="h-4 w-4" />
                <span>Verify as Bot Owner & Administrator (xSeif)</span>
              </div>
              <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full">Full Admin (0x8)</span>
            </button>

            <button
              onClick={async () => {
                await loginAsMember();
                onClose();
              }}
              className="w-full flex items-center justify-between rounded-xl border border-neutral-700 bg-space-850 px-4 py-3 text-xs font-medium text-neutral-300 hover:bg-space-800 hover:text-white transition"
            >
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-amber-400" />
                <span>Test as Regular Member (Without Admin Privileges)</span>
              </div>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full">Restricted</span>
            </button>
          </div>
        )}

        {/* Current status footer */}
        <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="text-neutral-400">Status:</span>
            {user ? (
              <span className="font-semibold text-emerald-400 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                {user.username} ({user.isOwner ? 'Owner' : user.isAdmin ? 'Admin' : 'Member'})
              </span>
            ) : (
              <span className="text-amber-400">Unauthenticated</span>
            )}
          </div>

          {user && (
            <button
              onClick={() => {
                logout();
                onClose();
              }}
              className="text-red-400 hover:text-red-300 transition text-[11px] underline"
            >
              Sign Out
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
