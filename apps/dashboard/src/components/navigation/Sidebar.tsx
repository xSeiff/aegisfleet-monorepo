'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Sliders,
  ShieldCheck,
  ShieldAlert,
  Palette,
  Bot,
  TrendingUp,
  Ticket,
  Mic,
  Coins,
  ArrowLeft,
  Sparkles,
  Server,
} from 'lucide-react';

interface SidebarProps {
  guildId: string;
}

export function DashboardSidebar({ guildId }: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { label: 'Overview & Telemetry', href: `/dashboard/${guildId}`, icon: LayoutDashboard },
    { label: 'General & Logs', href: `/dashboard/${guildId}/general`, icon: Sliders },
    { label: 'Galaxy Guard (Anti-Nuke)', href: `/dashboard/${guildId}/security`, icon: ShieldCheck },
    { label: 'AutoMod & Regex Shields', href: `/dashboard/${guildId}/automod`, icon: ShieldAlert },
    { label: 'Welcomer Studio', href: `/dashboard/${guildId}/welcomer`, icon: Palette },
    { label: 'Auto-Responders', href: `/dashboard/${guildId}/responders`, icon: Bot },
    { label: 'Leveling & XP Curves', href: `/dashboard/${guildId}/leveling`, icon: TrendingUp },
    { label: 'Ticket Support Suite', href: `/dashboard/${guildId}/tickets`, icon: Ticket },
    { label: 'Voice & Vanity Perks', href: `/dashboard/${guildId}/voice`, icon: Mic },
    { label: 'Economy & Casino', href: `/dashboard/${guildId}/economy`, icon: Coins },
  ];

  return (
    <aside className="w-72 border-r border-white/5 bg-space-900/80 backdrop-blur-2xl flex flex-col justify-between shrink-0 h-screen sticky top-0">
      <div className="flex flex-col h-full overflow-hidden">
        {/* Brand Header */}
        <div className="p-5 border-b border-white/5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 shadow-glow-indigo">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div>
              <span className="text-sm font-bold tracking-tight text-white block">Galaxy Bot</span>
              <span className="text-[10px] text-neutral-400 block font-mono">Mission Control</span>
            </div>
          </Link>
        </div>

        {/* Server Context Card */}
        <div className="p-4 border-b border-white/5">
          <div className="rounded-xl border border-white/5 bg-space-800/60 p-3 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 shrink-0">
              <Server className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-xs font-semibold text-white block truncate">
                Server #{guildId.slice(0, 6)}...
              </span>
              <span className="text-[11px] font-mono text-neutral-400 block truncate">
                ID: {guildId}
              </span>
            </div>
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20"></span>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          <span className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-neutral-500 block">
            Modules & Control
          </span>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-glow-indigo font-semibold'
                    : 'text-neutral-400 hover:bg-space-800/80 hover:text-white'
                }`}
              >
                <Icon className={`h-4 w-4 shrink-0 transition-colors ${
                  isActive ? 'text-white' : 'text-neutral-500 group-hover:text-indigo-400'
                }`} />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/5 space-y-2 bg-space-950/40">
          <Link
            href="/dashboard"
            className="flex items-center justify-center gap-2 rounded-lg border border-white/5 bg-space-850 px-3 py-2 text-xs font-medium text-neutral-300 hover:bg-space-800 hover:text-white transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Switch Server</span>
          </Link>
          <div className="text-center pt-1">
            <p className="text-[11px] text-neutral-500">
              Galaxy Bot • Created by{' '}
              <a
                href="https://github.com/xSeiff"
                target="_blank"
                rel="noreferrer"
                className="text-indigo-400 hover:underline font-medium"
              >
                xSeif
              </a>
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
