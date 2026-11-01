'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { DashboardNavbar } from '../../components/navigation/Navbar';
import { DiscordAuthModal } from '../../components/auth/DiscordAuthModal';
import {
  Server,
  Search,
  Plus,
  Shield,
  Users,
  ChevronRight,
  ExternalLink,
  Sparkles,
  Lock,
  CheckCircle2,
  AlertTriangle,
  KeyRound,
  RefreshCw,
  HelpCircle,
} from 'lucide-react';

const DISCORD_CLIENT_ID = '1355035089121316904';
const DISCORD_REDIRECT_URI = 'http://localhost:3000/api/auth/callback/discord';
const DISCORD_OAUTH_URL = `https://discord.com/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(
  DISCORD_REDIRECT_URI
)}&response_type=token&scope=identify%20guilds`;

export default function DashboardIndexPage() {
  const { user, guilds, isLoading, refreshGuilds } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const filteredServers = guilds.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.id.includes(searchQuery)
  );

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshGuilds();
    setIsRefreshing(false);
  };

  return (
    <div className="min-h-screen bg-space-950 text-neutral-100 flex flex-col bg-grid-pattern">
      <DashboardNavbar />

      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-12 z-10 space-y-8">
        {/* Verification Status Banner */}
        <div className="rounded-2xl border border-white/10 bg-space-900/90 p-5 backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-4">
            <div
              className={`h-12 w-12 rounded-2xl flex items-center justify-center text-xl shrink-0 ${
                user
                  ? user.isAdmin || user.isOwner
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
              }`}
            >
              {user ? (
                user.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.avatar}
                    alt={user.username}
                    className="h-12 w-12 rounded-2xl object-cover"
                  />
                ) : (
                  '👑'
                )
              ) : (
                <Shield className="h-6 w-6 text-indigo-400" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">
                  {user ? `${user.username}${user.discriminator ? `#${user.discriminator}` : ''}` : 'Discord Authentication Required'}
                </h2>
                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${
                    user?.isOwner
                      ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                      : user?.isAdmin
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : user
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                  }`}
                >
                  {user
                    ? user.isOwner
                      ? '⭐ Bot Owner'
                      : user.isAdmin
                      ? '✓ Verified Administrator'
                      : '⚠ Non-Admin Account'
                    : '🔒 Unverified'}
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-1">
                {user
                  ? `Discord account verified. Evaluating bitwise Administrator (0x8) and Manage Server (0x20) permissions.`
                  : 'Log in with Discord to view your real servers and verify server administration rights.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2.5 rounded-xl border border-white/10 bg-space-850 hover:bg-space-800 text-neutral-300 hover:text-white transition"
              title="Refresh Real Guilds"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin text-indigo-400' : ''}`} />
            </button>

            <button
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-4 py-2.5 text-xs font-semibold text-indigo-300 hover:bg-indigo-500/20 transition"
            >
              <KeyRound className="h-4 w-4" />
              <span>{user ? 'Switch / Test Permissions' : 'Verify with Discord'}</span>
            </button>
          </div>
        </div>

        {/* Not Logged In Callout */}
        {!user && (
          <div className="glass-panel rounded-3xl p-8 border border-indigo-500/20 bg-gradient-to-r from-indigo-950/40 via-space-900 to-purple-950/40 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
            <div className="space-y-2 text-center md:text-left">
              <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-400 border border-indigo-500/20">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Real Discord OAuth2 & Gateway Integration</span>
              </div>
              <h3 className="text-2xl font-black tracking-tight text-white">
                Connect Your Discord Account
              </h3>
              <p className="text-xs text-neutral-400 max-w-xl leading-relaxed">
                Authorize Galaxy Bot with the <code className="text-indigo-300">identify</code> and <code className="text-indigo-300">guilds</code> scopes to inspect servers you manage and edit security, welcomer, tickets, and leveling configurations.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <a
                href={DISCORD_OAUTH_URL}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] px-5 py-3 text-xs font-bold text-white shadow-glow-indigo transition active:scale-95"
              >
                <Shield className="h-4 w-4" />
                <span>Login with Discord</span>
              </a>

              <button
                onClick={() => setModalOpen(true)}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-space-850 px-4 py-3 text-xs font-semibold text-neutral-300 hover:text-white hover:bg-space-800 transition"
              >
                <KeyRound className="h-4 w-4 text-indigo-400" />
                <span>Verification Options</span>
              </button>
            </div>
          </div>
        )}

        {/* Page Title & Invite CTA */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-white/5">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-extrabold tracking-tight text-white">
                {user ? 'Your Discord Servers' : 'Active Discord Servers'}
              </h1>
              <span className="rounded-full bg-indigo-500/10 px-2.5 py-0.5 text-xs font-semibold text-indigo-400 border border-indigo-500/20">
                {guilds.length} Real Servers
              </span>
            </div>
            <p className="mt-1 text-sm text-neutral-400">
              {user
                ? 'Only servers where you have ADMINISTRATOR (0x8) or MANAGE_GUILD (0x20) permissions are unlocked for editing.'
                : 'Servers currently connected with Galaxy Bot across our sharded cluster network.'}
            </p>
          </div>

          <a
            href={`https://discord.com/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&permissions=8&scope=bot%20applications.commands`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2.5 text-xs font-semibold text-white shadow-glow-indigo hover:from-indigo-500 hover:to-purple-500 transition active:scale-95 self-start md:self-auto"
          >
            <Plus className="h-4 w-4" />
            <span>Invite Galaxy Bot to Server</span>
          </a>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-neutral-500" />
          <input
            type="text"
            placeholder="Search servers by name or Guild Snowflake ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-neutral-800 bg-space-900/80 pl-10 pr-4 py-3 text-xs text-white placeholder-neutral-500 focus:border-indigo-500 focus:outline-none transition"
          />
        </div>

        {/* Real Servers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredServers.map((server) => {
            const botInviteUrl = `https://discord.com/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&guild_id=${server.id}&permissions=8&scope=bot%20applications.commands`;

            return (
              <div
                key={server.id}
                className={`glass-panel rounded-2xl p-5 block transition-all ${
                  server.hasAdmin
                    ? 'border-white/10 hover:border-indigo-500/40 bg-space-900/80'
                    : 'border-white/5 opacity-70 bg-space-950/60'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-600/20 border border-indigo-500/30 text-xl shrink-0 overflow-hidden">
                      {server.icon ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={server.icon}
                          alt={server.name}
                          className="h-full w-full object-cover rounded-2xl"
                        />
                      ) : (
                        <span>🪐</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-white truncate flex items-center gap-1.5">
                        <span className="truncate">{server.name}</span>
                        {server.owner && (
                          <span className="text-amber-400 text-xs shrink-0" title="Server Owner">👑</span>
                        )}
                      </h3>
                      <p className="text-[11px] font-mono text-neutral-400 truncate">
                        ID: {server.id}
                      </p>
                    </div>
                  </div>

                  {/* Permission badge */}
                  <div>
                    {server.hasAdmin ? (
                      <span className="inline-flex items-center gap-1 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2.5 py-0.5 text-[10px] font-medium shrink-0">
                        <CheckCircle2 className="h-3 w-3" />
                        <span>Administrator</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-red-400 bg-red-500/10 border border-red-500/20 rounded-full px-2.5 py-0.5 text-[10px] font-medium shrink-0">
                        <Lock className="h-3 w-3" />
                        <span>No Admin Perms</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-neutral-400">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 text-neutral-500" />
                      <span>{server.memberCount ? server.memberCount.toLocaleString() : '—'} members</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      {server.botInGuild ? (
                        <span className="text-emerald-400 text-[11px] flex items-center gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                          <span>Bot Active</span>
                        </span>
                      ) : (
                        <span className="text-amber-400 text-[11px] flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          <span>Not in Server</span>
                        </span>
                      )}
                    </span>
                  </div>

                  {/* Action buttons based on permissions and bot presence */}
                  <div>
                    {server.hasAdmin ? (
                      server.botInGuild ? (
                        <Link
                          href={`/dashboard/${server.id}/security`}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-glow-indigo hover:bg-indigo-500 transition"
                        >
                          <span>Manage Server</span>
                          <ChevronRight className="h-3.5 w-3.5" />
                        </Link>
                      ) : (
                        <a
                          href={botInviteUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-500/40 bg-indigo-500/20 px-3.5 py-1.5 text-xs font-semibold text-indigo-300 hover:bg-indigo-500/30 transition"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          <span>Invite Bot</span>
                        </a>
                      )
                    ) : (
                      <button
                        disabled
                        className="inline-flex items-center gap-1.5 rounded-xl border border-white/5 bg-space-950 px-3.5 py-1.5 text-xs font-medium text-neutral-500 cursor-not-allowed"
                        title="You must hold Administrator (0x8) or Manage Server (0x20) permissions in this Discord guild."
                      >
                        <Lock className="h-3 w-3" />
                        <span>Restricted</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredServers.length === 0 && (
          <div className="rounded-2xl border border-dashed border-neutral-800 p-12 text-center space-y-3">
            <Server className="h-8 w-8 text-neutral-600 mx-auto" />
            <p className="text-sm font-semibold text-neutral-300">No matching servers found</p>
            <p className="text-xs text-neutral-500">
              Try adjusting your search query or verify your Discord credentials.
            </p>
          </div>
        )}
      </main>

      <DiscordAuthModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
