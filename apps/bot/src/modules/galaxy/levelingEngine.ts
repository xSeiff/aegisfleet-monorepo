import { Message, VoiceState, GuildMember } from 'discord.js';
import Redis from 'ioredis';
import { prisma } from '@hugebot/database';

export class GalaxyLevelingEngine {
  private redis: Redis;

  constructor(redisClient: Redis) {
    this.redis = redisClient;
  }

  public async processTextMessage(message: Message): Promise<void> {
    if (!message.guild || message.author.bot) return;

    const guildId = message.guild.id;
    const userId = message.author.id;

    // 1-minute cooldown between XP gains
    const cooldownKey = `xp:cooldown:${guildId}:${userId}`;
    const onCooldown = await this.redis.get(cooldownKey);
    if (onCooldown) return;

    await this.redis.set(cooldownKey, '1', 'EX', 60);

    // Multipliers calculation
    let multiplier = 1.0;
    const multipliers = await prisma.levelMultiplier.findMany({ where: { guildId } });
    for (const m of multipliers) {
      if (m.targetType === 'CHANNEL' && m.targetId === message.channel.id) {
        multiplier = Math.max(multiplier, m.multiplier);
      } else if (m.targetType === 'ROLE' && message.member?.roles.cache.has(m.targetId)) {
        multiplier = Math.max(multiplier, m.multiplier);
      }
    }

    const baseGain = Math.floor(Math.random() * 11) + 15; // 15-25 XP
    const finalGain = BigInt(Math.floor(baseGain * multiplier));

    await this.addXp(message.guild.id, userId, message.member, finalGain, message.channel.id);
  }

  public async processVoiceHeartbeat(member: GuildMember, state: VoiceState): Promise<void> {
    if (member.user.bot) return;
    // Anti-AFK, mute/deafen penalties
    if (state.mute || state.deaf || state.selfMute || state.selfDeaf) return;
    if (state.channel && state.channel.members.filter((m) => !m.user.bot).size < 2) return; // Must have >= 2 humans

    const guildId = member.guild.id;
    const voiceXpGain = 10n; // 10 XP per minute of voice activity

    await this.addXp(guildId, member.id, member, voiceXpGain);
  }

  private async addXp(guildId: string, userId: string, member: GuildMember | null, amount: bigint, channelId?: string): Promise<void> {
    await prisma.user.upsert({
      where: { id: userId },
      create: {
        id: userId,
        username: member?.user?.username || 'Unknown',
        discriminator: member?.user?.discriminator || '0',
      },
      update: {
        username: member?.user?.username || undefined,
      },
    });

    const progress = await prisma.levelProgress.upsert({
      where: { userId_guildId: { userId, guildId } },
      create: {
        userId,
        guildId,
        totalXp: amount,
        currentLevel: 1,
      },
      update: {
        totalXp: { increment: amount },
      },
    });

    const currentXp = progress.totalXp;
    const nextLevelReq = BigInt(progress.currentLevel * 300);

    if (currentXp >= nextLevelReq) {
      const newLevel = progress.currentLevel + 1;
      await prisma.levelProgress.update({
        where: { userId_guildId: { userId, guildId } },
        data: { currentLevel: newLevel },
      });

      // Role Reward Ladder Check
      if (member) {
        const reward = await prisma.roleRewardLadder.findUnique({
          where: { guildId_levelRequirement: { guildId, levelRequirement: newLevel } },
        });
        if (reward) {
          await member.roles.add(reward.roleId, `Level Up Reward (Level ${newLevel})`).catch(() => null);
        }
      }

      console.log(`[Leveling Engine] User ${userId} leveled up to ${newLevel} in guild ${guildId}`);
    }
  }
}
