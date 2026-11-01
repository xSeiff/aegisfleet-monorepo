import { Message, TextChannel, PermissionFlagsBits } from 'discord.js';
import Redis from 'ioredis';
import { prisma } from '@hugebot/database';

export class AdaptiveHeatEngine {
  private redis: Redis;

  constructor(redisClient: Redis) {
    this.redis = redisClient;
  }

  public async evaluateMessage(message: Message): Promise<void> {
    if (!message.guild || message.author.bot) return;

    const guildId = message.guild.id;
    const userId = message.author.id;
    const channelId = message.channel.id;

    const config = await prisma.heatConfig.findUnique({
      where: { guildId },
    });

    if (!config || !config.enabled) return;

    // Calculate Heat Units
    let heat = config.msgWeight;

    // Newlines / Wall-of-Text
    const newlines = (message.content.match(/\n/g) || []).length;
    if (newlines > 5) {
      heat += (newlines - 5) * config.newlineWeight;
    }

    // Fast Mentions
    const mentionsCount = message.mentions.users.size + message.mentions.roles.size + (message.mentions.everyone ? 5 : 0);
    if (mentionsCount > 2) {
      heat += mentionsCount * config.mentionWeight;
    }

    // Attachments & Stickers
    if (message.attachments.size > 0 || message.stickers.size > 0) {
      heat += (message.attachments.size + message.stickers.size) * config.attachmentWeight;
    }

    // Push into Redis with sliding decay
    const userHeatKey = `heat:user:${guildId}:${userId}`;
    const channelHeatKey = `heat:channel:${guildId}:${channelId}`;

    const pipeline = this.redis.multi();
    pipeline.incrbyfloat(userHeatKey, heat);
    pipeline.expire(userHeatKey, config.decaySeconds * 3);
    pipeline.incrbyfloat(channelHeatKey, heat);
    pipeline.expire(channelHeatKey, config.decaySeconds * 3);
    const results = await pipeline.exec();

    const userHeat = parseFloat(results?.[0]?.[1] as string || '0');
    const channelHeat = parseFloat(results?.[2]?.[1] as string || '0');

    // Channel Panic Mode evaluation
    if (channelHeat > config.panicModeThreshold && message.channel.isTextBased()) {
      await this.triggerChannelPanic(message.channel as TextChannel, 'Heat Panic Mode: Severe Spam Raid Detected');
    }

    // User Escalation ladder
    if (userHeat > config.banThreshold) {
      await this.enforcePunishment(message, 'BAN', 'Heat Engine: Severe Automated Spam Breach');
    } else if (userHeat > config.quarantineThreshold) {
      await this.enforcePunishment(message, 'QUARANTINE', 'Heat Engine: Critical Spam Exceeded');
    } else if (userHeat > config.muteThreshold) {
      await this.enforcePunishment(message, 'TIMEOUT_10M', 'Heat Engine: Excessive Spam Rate');
    } else if (userHeat > config.warnThreshold) {
      await this.enforcePunishment(message, 'WARN', 'Heat Engine: Warning - Slow down your messages');
    }
  }

  private async enforcePunishment(message: Message, action: 'WARN' | 'TIMEOUT_10M' | 'QUARANTINE' | 'BAN', reason: string): Promise<void> {
    const member = message.member;
    if (!member || !member.moderatable) return;

    const lockKey = `punishment:cooldown:${message.guild!.id}:${message.author.id}:${action}`;
    const acquired = await this.redis.set(lockKey, '1', 'EX', 15, 'NX');
    if (!acquired) return;

    const channel = message.channel;

    switch (action) {
      case 'WARN':
        await message.reply({ content: `⚠️ **Warning:** Slow down! You are generating too much heat in this channel.` }).catch(() => null);
        break;
      case 'TIMEOUT_10M':
        await member.timeout(10 * 60 * 1000, reason).catch(() => null);
        if ('send' in channel) {
          await channel.send({ content: `🔇 <@${member.id}> has been timed out for 10 minutes (Heat Limit Exceeded).` }).catch(() => null);
        }
        break;
      case 'QUARANTINE':
        const securityConfig = await prisma.antiNukeConfig.findUnique({ where: { guildId: message.guild!.id } });
        if (securityConfig?.quarantineRoleId) {
          await member.roles.add(securityConfig.quarantineRoleId, reason).catch(() => null);
          if ('send' in channel) {
            await channel.send({ content: `🚨 <@${member.id}> has been quarantined due to critical spam threshold.` }).catch(() => null);
          }
        }
        break;
      case 'BAN':
        await member.ban({ reason, deleteMessageSeconds: 3600 }).catch(() => null);
        if ('send' in channel) {
          await channel.send({ content: `⛔ <@${member.id}> was banned for raid-level spam activity.` }).catch(() => null);
        }
        break;
    }
  }

  private async triggerChannelPanic(channel: TextChannel, reason: string): Promise<void> {
    const panicLock = `panic:channel:${channel.guild.id}:${channel.id}`;
    const acquired = await this.redis.set(panicLock, '1', 'EX', 60, 'NX');
    if (!acquired) return;

    console.warn(`[Heat Panic] Locking down channel ${channel.name} in guild ${channel.guild.id}`);
    await channel.permissionOverwrites.edit(channel.guild.roles.everyone, {
      SendMessages: false,
    }, { reason }).catch(() => null);

    await channel.send({
      content: `🚨 **HEAT PANIC MODE ACTIVATED**: This channel has been temporarily locked due to an extreme spam surge. Normal service will resume automatically.`,
    }).catch(() => null);
  }
}
