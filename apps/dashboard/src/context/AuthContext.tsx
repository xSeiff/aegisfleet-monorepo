'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface DiscordUser {
  id: string;
  username: string;
  discriminator: string;
  avatar: string;
  isOwner: boolean;
  isAdmin: boolean;
}

export interface UserGuild {
  id: string;
  name: string;
  icon: string | null;
  owner: boolean;
  permissions: string; // bitmask
  hasAdmin: boolean;
  botInGuild: boolean;
  memberCount: number;
}

interface AuthContextType {
  user: DiscordUser | null;
  guilds: UserGuild[];
  token: string | null;
  isLoading: boolean;
  setSessionFromOAuth: (user: DiscordUser, guilds: UserGuild[], token?: string) => void;
  loginWithToken: (token: string) => Promise<{ success: boolean; error?: string }>;
  loginAsOwner: () => Promise<void>;
  loginAsMember: () => Promise<void>;
  logout: () => void;
  refreshGuilds: () => Promise<void>;
  hasPermissionForGuild: (guildId: string) => boolean;
}

const OWNER_USER: DiscordUser = {
  id: '938056009459576882',
  username: 'xSeif',
  discriminator: '0',
  avatar: 'https://cdn.discordapp.com/embed/avatars/0.png',
  isOwner: true,
  isAdmin: true,
};

const MEMBER_USER: DiscordUser = {
  id: '111222333444555666',
  username: 'RegularAstronaut',
  discriminator: '0',
  avatar: 'https://cdn.discordapp.com/embed/avatars/1.png',
  isOwner: false,
  isAdmin: false,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<DiscordUser | null>(null);
  const [guilds, setGuilds] = useState<UserGuild[]>([]);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch real guilds from our API endpoint
  const fetchRealGuilds = useCallback(async (discordToken?: string | null) => {
    try {
      const url = discordToken
        ? `/api/discord/guilds?token=${encodeURIComponent(discordToken)}`
        : '/api/discord/guilds';
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.guilds) {
          setGuilds(data.guilds);
        }
        if (data.user && !user) {
          setUser(data.user);
        }
        return data;
      }
    } catch (e) {
      console.error('Failed to load real guilds:', e);
    }
    return null;
  }, [user]);

  useEffect(() => {
    async function initAuth() {
      setIsLoading(true);

      const savedToken = localStorage.getItem('galaxy_discord_token');
      const savedUser = localStorage.getItem('galaxy_auth_user');

      if (savedToken) {
        setToken(savedToken);
        const data = await fetchRealGuilds(savedToken);
        if (data?.user) {
          setUser(data.user);
        }
      } else if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          setUser(parsed);
          const data = await fetchRealGuilds();
          if (data?.guilds) {
            if (parsed.isOwner) {
              setGuilds(data.guilds.map((g: UserGuild) => ({ ...g, hasAdmin: true })));
            } else {
              setGuilds(data.guilds.map((g: UserGuild) => ({ ...g, hasAdmin: false })));
            }
          }
        } catch {
          await fetchRealGuilds();
        }
      } else {
        // Unauthenticated initial state: load real guilds so user sees real bot servers
        await fetchRealGuilds();
      }

      setIsLoading(false);
    }

    initAuth();
  }, [fetchRealGuilds]);

  const setSessionFromOAuth = (newUser: DiscordUser, newGuilds: UserGuild[], newToken?: string) => {
    setUser(newUser);
    setGuilds(newGuilds);
    if (newToken) {
      setToken(newToken);
      localStorage.setItem('galaxy_discord_token', newToken);
    }
    localStorage.setItem('galaxy_auth_user', JSON.stringify(newUser));
  };

  const loginWithToken = async (manualToken: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/discord/guilds?token=${encodeURIComponent(manualToken.trim())}`);
      if (!res.ok) {
        setIsLoading(false);
        return { success: false, error: `Invalid Discord token (Status ${res.status})` };
      }

      const data = await res.json();
      if (!data.user) {
        setIsLoading(false);
        return { success: false, error: 'Could not fetch user profile with this token' };
      }

      setSessionFromOAuth(data.user, data.guilds, manualToken.trim());
      setIsLoading(false);
      return { success: true };
    } catch (e: any) {
      setIsLoading(false);
      return { success: false, error: e.message || 'Verification failed' };
    }
  };

  const loginAsOwner = async () => {
    setUser(OWNER_USER);
    localStorage.setItem('galaxy_auth_user', JSON.stringify(OWNER_USER));
    localStorage.removeItem('galaxy_discord_token');
    setToken(null);
    const data = await fetchRealGuilds();
    if (data?.guilds) {
      setGuilds(data.guilds.map((g: UserGuild) => ({ ...g, hasAdmin: true })));
    }
  };

  const loginAsMember = async () => {
    setUser(MEMBER_USER);
    localStorage.setItem('galaxy_auth_user', JSON.stringify(MEMBER_USER));
    localStorage.removeItem('galaxy_discord_token');
    setToken(null);
    const data = await fetchRealGuilds();
    if (data?.guilds) {
      // Regular astronaut has NO administrative perms (0x8 or 0x20)
      setGuilds(data.guilds.map((g: UserGuild) => ({ ...g, hasAdmin: false, owner: false })));
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('galaxy_auth_user');
    localStorage.removeItem('galaxy_discord_token');
    fetchRealGuilds();
  };

  const refreshGuilds = async () => {
    await fetchRealGuilds(token);
  };

  const hasPermissionForGuild = (guildId: string): boolean => {
    if (!user) return false;
    if (user.isOwner) return true;
    const target = guilds.find((g) => g.id === guildId);
    if (!target) return user.isAdmin;
    return target.hasAdmin;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        guilds,
        token,
        isLoading,
        setSessionFromOAuth,
        loginWithToken,
        loginAsOwner,
        loginAsMember,
        logout,
        refreshGuilds,
        hasPermissionForGuild,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
