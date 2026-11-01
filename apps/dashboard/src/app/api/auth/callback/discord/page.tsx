'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../../context/AuthContext';
import { Sparkles, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

export default function DiscordOAuthCallbackPage() {
  const router = useRouter();
  const { setSessionFromOAuth } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    async function handleAuth() {
      try {
        // Parse fragment: #access_token=...&token_type=Bearer...
        const hash = window.location.hash.startsWith('#')
          ? window.location.hash.substring(1)
          : window.location.hash;

        const params = new URLSearchParams(hash);
        const accessToken = params.get('access_token');
        const error = params.get('error');
        const errorDesc = params.get('error_description');

        if (error) {
          setStatus('error');
          setErrorMessage(errorDesc || 'Discord authentication was denied.');
          setTimeout(() => router.push('/dashboard'), 3000);
          return;
        }

        if (!accessToken) {
          setStatus('error');
          setErrorMessage('No Discord access token was received in the callback.');
          setTimeout(() => router.push('/dashboard'), 3000);
          return;
        }

        // Fetch real identity and verified guilds with administrator permission checks
        const res = await fetch(`/api/discord/guilds?token=${accessToken}`);
        if (!res.ok) {
          throw new Error(`Failed to fetch Discord guilds: status ${res.status}`);
        }

        const data = await res.json();
        if (!data.user) {
          throw new Error('Could not retrieve user identity from Discord.');
        }

        // Save token & session to AuthContext and localStorage
        localStorage.setItem('galaxy_discord_token', accessToken);
        setSessionFromOAuth(data.user, data.guilds, accessToken);

        setStatus('success');
        setTimeout(() => {
          router.push('/dashboard');
        }, 1200);
      } catch (err: any) {
        console.error('Discord callback error:', err);
        setStatus('error');
        setErrorMessage(err.message || 'Verification failed. Returning to dashboard...');
        setTimeout(() => router.push('/dashboard'), 3000);
      }
    }

    handleAuth();
  }, [router, setSessionFromOAuth]);

  return (
    <div className="min-h-screen bg-space-950 text-white flex items-center justify-center p-6 bg-grid-pattern">
      <div className="glass-panel max-w-md w-full rounded-3xl p-8 text-center space-y-6 border border-white/10 shadow-2xl">
        <div className="flex justify-center">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-600 to-cyan-500 flex items-center justify-center shadow-glow-indigo">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
        </div>

        {status === 'loading' && (
          <div className="space-y-3">
            <div className="flex justify-center">
              <Loader2 className="h-8 w-8 text-indigo-400 animate-spin" />
            </div>
            <h2 className="text-xl font-bold tracking-tight">Verifying Discord Permissions</h2>
            <p className="text-xs text-neutral-400">
              Inspecting your Discord servers and calculating bitwise Administrator (0x8) rights...
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-3">
            <div className="flex justify-center">
              <CheckCircle2 className="h-8 w-8 text-emerald-400" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-emerald-400">Verification Successful!</h2>
            <p className="text-xs text-neutral-400">
              Identity confirmed. Redirecting to your server command center...
            </p>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-3">
            <div className="flex justify-center">
              <AlertCircle className="h-8 w-8 text-rose-400" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-rose-400">Authentication Error</h2>
            <p className="text-xs text-neutral-400">{errorMessage}</p>
          </div>
        )}
      </div>
    </div>
  );
}
