import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@hugebot/database';
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
const BOT_OWNER_ID = process.env.BOT_OWNER_ID || '938056009459576882';

interface BotGuildInfo {
  id: string;
  name: string;
  icon: string | null;
  memberCount: number;
  ownerId: string;
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const tokenParam = url.searchParams.get('token');
    const authHeader = req.headers.get('authorization');
    const userToken = tokenParam || (authHeader ? authHeader.replace(/^Bearer\s+/i, '') : null);

    // 1. Fetch real bot guilds from Redis & Database
    let botGuilds: BotGuildInfo[] = [];
    try {
      const cached = await redis.get('bot:guilds');
      if (cached) {
        botGuilds = JSON.parse(cached);
      }
    } catch (err) {
      console.error('Failed to get bot:guilds from Redis:', err);
    }

    // If redis was empty, check prisma guildConfig
    if (botGuilds.length === 0) {
      const configs = await prisma.guildConfig.findMany();
      botGuilds = configs.map((c) => ({
        id: c.guildId,
        name: `Discord Server (${c.guildId})`,
        icon: null,
        memberCount: 0,
        ownerId: BOT_OWNER_ID,
      }));
    }

    const botGuildMap = new Map<string, BotGuildInfo>();
    botGuilds.forEach((g) => botGuildMap.set(g.id, g));

    // 2. If user provided a Discord Token, fetch their real profile & guilds from Discord API
    if (userToken && userToken !== 'owner-session' && userToken !== 'member-session') {
      try {
        const [userRes, guildsRes] = await Promise.all([
          fetch('https://discord.com/api/v10/users/@me', {
            headers: { Authorization: `Bearer ${userToken}` },
          }),
          fetch('https://discord.com/api/v10/users/@me/guilds', {
            headers: { Authorization: `Bearer ${userToken}` },
          }),
        ]);

        if (userRes.ok && guildsRes.ok) {
          const discordUser = await userRes.json();
          const discordGuilds = await guildsRes.json();

          const isOwner = discordUser.id === BOT_OWNER_ID;

          const formattedGuilds = discordGuilds.map((g: any) => {
            const perms = BigInt(g.permissions || '0');
            // Check bit 3 (0x8 = ADMINISTRATOR) and bit 5 (0x20 = MANAGE_GUILD)
            const hasAdmin = g.owner === true || isOwner || (perms & 0x8n) === 0x8n || (perms & 0x20n) === 0x20n;
            const botG = botGuildMap.get(g.id);

            return {
              id: g.id,
              name: g.name,
              icon: g.icon ? `https://cdn.discordapp.com/icons/${g.id}/${g.icon}.png` : null,
              owner: g.owner === true,
              permissions: g.permissions,
              hasAdmin,
              botInGuild: !!botG,
              memberCount: botG?.memberCount ?? 0,
            };
          });

          return NextResponse.json({
            user: {
              id: discordUser.id,
              username: discordUser.username,
              discriminator: discordUser.discriminator === '0' ? '' : discordUser.discriminator,
              avatar: discordUser.avatar
                ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`
                : `https://cdn.discordapp.com/embed/avatars/${Number(BigInt(discordUser.id) % 5n)}.png`,
              isOwner,
              isAdmin: isOwner || formattedGuilds.some((g: any) => g.hasAdmin),
            },
            guilds: formattedGuilds,
          });
        }
      } catch (e) {
        console.error('Discord API Token validation error:', e);
      }
    }

    // 3. Fallback: Return the real bot guilds fetched live from the Discord Gateway & Redis
    const realBotGuilds = botGuilds.map((g) => ({
      id: g.id,
      name: g.name,
      icon: g.icon,
      owner: g.ownerId === BOT_OWNER_ID,
      permissions: '8', // Administrator
      hasAdmin: true,
      botInGuild: true,
      memberCount: g.memberCount,
    }));

    return NextResponse.json({
      user: null,
      guilds: realBotGuilds,
    });
  } catch (error: any) {
    console.error('Error in /api/discord/guilds:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
