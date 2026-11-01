import {
  Guild,
  AuditLogEvent,
  GuildAuditLogsEntry,
  PermissionFlagsBits,
  Role,
} from 'discord.js';
import Redis from 'ioredis';
import { prisma } from '@hugebot/database';

export class AntiNukeInterceptor {
  private redis: Redis;

  constructor(redisClient: Redis) {
    this.redis = redisClient;
  }

  public async inspectAuditAction(guild: Guild, entry: GuildAuditLogsEntry): Promise<void> {
    const config = await prisma.antiNukeConfig.findUnique({
      where: { guildId: guild.id },
    });

    if (!config || !config.enabled) return;
    if (!entry.executor || entry.executor.id === guild.client.user?.id || entry.executor.id === guild.ownerId) {
      return;
    }

    const executorId = entry.executor.id;
    let limit = 5;
    let actionKey = 'unknown';

    switch (entry.action) {
      case AuditLogEvent.ChannelDelete:
        limit = config.channelDeleteLimit;
        actionKey = 'channel_delete';
        break;
      case AuditLogEvent.ChannelCreate:
        limit = config.channelCreateLimit;
        actionKey = 'channel_create';
        break;
      case AuditLogEvent.RoleDelete:
        limit = config.roleDeleteLimit;
        actionKey = 'role_delete';
        break;
      case AuditLogEvent.RoleCreate:
        limit = config.roleCreateLimit;
        actionKey = 'role_create';
        break;
      case AuditLogEvent.MemberBanAdd:
        limit = config.banLimit;
        actionKey = 'ban';
        break;
      case AuditLogEvent.MemberKick:
        limit = config.kickLimit;
        actionKey = 'kick';
        break;
      case AuditLogEvent.WebhookCreate:
        limit = config.webhookLimit;
        actionKey = 'webhook_create';
        break;
      case AuditLogEvent.BotAdd:
        if (config.kickUnauthorizedBots && entry.target && 'bot' in entry.target && entry.target.bot) {
          const targetBotId = entry.targetId ?? entry.target?.id;
          if (targetBotId) {
            await this.handleUnauthorizedBotAdd(guild, targetBotId, executorId);
          }
          return;
        }
        break;
    }

    const rateKey = `antinuke:${guild.id}:${executorId}:${actionKey}`;
    const count = await this.redis.incr(rateKey);
    if (count === 1) {
      await this.redis.expire(rateKey, config.timeWindowSeconds);
    }

    if (count > limit) {
      await this.quarantineRogueStaff(guild, executorId, `Anti-Nuke Triggered: Exceeded ${limit} ${actionKey} in ${config.timeWindowSeconds}s`);
    }
  }

  public async quarantineRogueStaff(guild: Guild, staffUserId: string, reason: string): Promise<void> {
    try {
      const member = await guild.members.fetch(staffUserId).catch(() => null);
      if (!member || member.id === guild.ownerId) return;

      const config = await prisma.antiNukeConfig.findUnique({
        where: { guildId: guild.id },
      });

      const dangerousRoles = member.roles.cache.filter((r) =>
        r.permissions.has(PermissionFlagsBits.Administrator) ||
        r.permissions.has(PermissionFlagsBits.ManageGuild) ||
        r.permissions.has(PermissionFlagsBits.ManageRoles) ||
        r.permissions.has(PermissionFlagsBits.ManageChannels) ||
        r.permissions.has(PermissionFlagsBits.BanMembers) ||
        r.permissions.has(PermissionFlagsBits.KickMembers)
      );

      for (const [, role] of dangerousRoles) {
        await member.roles.remove(role, reason).catch(() => null);
      }

      if (config?.quarantineRoleId) {
        await member.roles.add(config.quarantineRoleId, reason).catch(() => null);
      }

      await prisma.moderationLog.create({
        data: {
          guildId: guild.id,
          action: 'QUARANTINE',
          targetUserId: staffUserId,
          moderatorId: guild.client.user.id,
          reason,
        },
      });

      console.warn(`[Anti-Nuke Interceptor] Quarantined rogue staff member ${staffUserId} in guild ${guild.id}`);
    } catch (err) {
      console.error('[Anti-Nuke] Failed to quarantine staff:', err);
    }
  }

  public async handleEveryoneRoleGuard(oldRole: Role, newRole: Role): Promise<void> {
    if (newRole.id !== newRole.guild.id) return;

    const config = await prisma.antiNukeConfig.findUnique({
      where: { guildId: newRole.guild.id },
    });

    if (!config || !config.protectEveryoneRole) return;

    const dangerous = [
      PermissionFlagsBits.Administrator,
      PermissionFlagsBits.ManageGuild,
      PermissionFlagsBits.ManageRoles,
      PermissionFlagsBits.ManageChannels,
      PermissionFlagsBits.MentionEveryone,
    ];

    const gainedDangerous = dangerous.some(
      (perm) => !oldRole.permissions.has(perm) && newRole.permissions.has(perm)
    );

    if (gainedDangerous) {
      console.warn(`[@everyone Guard] Reverting dangerous permission tampering on @everyone in ${newRole.guild.id}`);
      await newRole.setPermissions(oldRole.permissions, 'Anti-Nuke @everyone Protection Triggered');
    }
  }

  private async handleUnauthorizedBotAdd(guild: Guild, botId: string, invokerId: string): Promise<void> {
    console.warn(`[Bot Add Guard] Unauthorized bot ${botId} added by ${invokerId}. Purging...`);
    const botMember = await guild.members.fetch(botId).catch(() => null);
    if (botMember && botMember.kickable) {
      await botMember.kick('Anti-Nuke Bot Add Guard: Unauthorized Bot Integration');
    }
    await this.quarantineRogueStaff(guild, invokerId, 'Anti-Nuke Bot Add Guard: Unauthorized Bot Invitation');
  }
}
