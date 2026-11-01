import React from 'react';
import { DashboardSidebar } from '../../../components/navigation/Sidebar';
import Link from 'next/link';
import { PermissionGuard } from '../../../components/auth/PermissionGuard';
import { Shield, Sparkles, ExternalLink, Activity, Bell } from 'lucide-react';

export default async function GuildDashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ guildId: string }>;
}) {
  const { guildId } = await params;

  return (
    <div className="flex min-h-screen bg-space-950 text-neutral-100 bg-grid-pattern relative">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/5 pointer-events-none rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-[20%] w-[500px] h-[500px] bg-purple-600/5 pointer-events-none rounded-full blur-3xl" />

      {/* Sidebar */}
      <DashboardSidebar guildId={guildId} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Control Bar */}
        <header className="sticky top-0 z-40 border-b border-white/5 bg-space-950/80 backdrop-blur-xl px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xs text-neutral-400">Server Mission Control</span>
            <span className="text-neutral-600">/</span>
            <span className="text-xs font-mono text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-md">
              {guildId}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Cluster 0 Online</span>
            </div>

            <a
              href="https://github.com/xSeiff"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-neutral-400 hover:text-white transition inline-flex items-center gap-1"
            >
              <span>By xSeif</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </header>

        {/* Page Viewport */}
        <main className="flex-1 p-8">
          <PermissionGuard guildId={guildId}>
            {children}
          </PermissionGuard>
        </main>
      </div>
    </div>
  );
}
