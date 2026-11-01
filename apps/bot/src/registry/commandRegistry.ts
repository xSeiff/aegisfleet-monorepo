import {
  ChatInputCommandInteraction,
  Collection,
  InteractionContextType,
  ApplicationIntegrationType,
} from 'discord.js';
import Redis from 'ioredis';
import { EnterpriseSlashCommand, CommandContext } from './commandTypes';
import { prisma } from '@hugebot/database';

export class CommandRegistry {
  private static instance: CommandRegistry;
  public readonly commands = new Collection<string, EnterpriseSlashCommand>();
  private readonly redis?: Redis;

  private constructor(redisClient?: Redis) {
    this.redis = redisClient;
  }

  public static getInstance(redisClient?: Redis): CommandRegistry {
    if (!CommandRegistry.instance) {
      CommandRegistry.instance = new CommandRegistry(redisClient);
    }
    return CommandRegistry.instance;
  }

  public registerCommand(command: EnterpriseSlashCommand): void {
    if (this.commands.has(command.name)) {
      throw new Error(`Command "${command.name}" is already registered.`);
    }
    this.commands.set(command.name, command);
  }

  public async handleInteraction(interaction: ChatInputCommandInteraction): Promise<void> {
    const rootCommand = this.commands.get(interaction.commandName);
    if (!rootCommand) {
      await interaction.reply({ content: 'Command definition not found.', ephemeral: true });
      return;
    }

    const isUserInstall = interaction.authorizingIntegrationOwners[ApplicationIntegrationType.UserInstall] !== undefined;
    const isGuildInstall = interaction.authorizingIntegrationOwners[ApplicationIntegrationType.GuildInstall] !== undefined;

    const ctx: CommandContext = {
      interaction,
      isUserInstall,
      isGuildInstall,
      invokerId: interaction.user.id,
      guildId: interaction.guildId,
      channelId: interaction.channelId,
    };

    const groupName = interaction.options.getSubcommandGroup(false);
    const subName = interaction.options.getSubcommand(false);

    let handlerTarget = rootCommand.rootSubcommands.get(subName ?? '');
    if (groupName) {
      const group = rootCommand.groups.get(groupName);
      if (group && subName) {
        handlerTarget = group.subcommands.get(subName);
      }
    }

    if (!handlerTarget && !rootCommand.execute) {
      await interaction.reply({ content: 'Subcommand handler not found.', ephemeral: true });
      return;
    }

    // 1. Permission Evaluation (Guild Only)
    if (interaction.inGuild() && handlerTarget?.requiredPermissions?.length) {
      const memberPermissions = interaction.memberPermissions;
      if (!memberPermissions || !memberPermissions.has(handlerTarget.requiredPermissions)) {
        await interaction.reply({
          content: 'You do not have the required permissions to execute this subcommand.',
          ephemeral: true,
        });
        return;
      }
    }

    // 2. Redis Sliding Window Rate-Limiter (if Redis connected)
    const cooldownSeconds = handlerTarget?.cooldownSeconds ?? 3;
    if (this.redis && this.redis.status === 'ready') {
      const cooldownKey = `cooldown:${interaction.user.id}:${interaction.commandName}:${groupName ?? 'root'}:${subName ?? 'default'}`;
      const currentTimestamp = Date.now();
      const windowStart = currentTimestamp - cooldownSeconds * 1000;

      const pipeline = this.redis.multi();
      pipeline.zremrangebyscore(cooldownKey, 0, windowStart);
      pipeline.zcard(cooldownKey);
      pipeline.zadd(cooldownKey, currentTimestamp, `${currentTimestamp}`);
      pipeline.expire(cooldownKey, cooldownSeconds);
      const results = await pipeline.exec();

      if (results && results[1]) {
        const callCount = results[1][1] as number;
        if (callCount > 1) {
          await interaction.reply({
            content: `Slow down! This subcommand has a ${cooldownSeconds}s cooldown.`,
            ephemeral: true,
          });
          return;
        }
      }
    }

    // 3. Premium / Entitlement Check
    if (handlerTarget?.requirePremium) {
      const hasGuildPremium = interaction.guildId
        ? await prisma.guildConfig.findUnique({
            where: { guildId: interaction.guildId },
            select: { isPremium: true },
          })
        : null;

      const hasUserPremium = await prisma.entitlement.findFirst({
        where: { userId: interaction.user.id, isActive: true },
      });

      if (!hasGuildPremium?.isPremium && !hasUserPremium) {
        await interaction.reply({
          content: 'This feature requires an active Guild or User Premium subscription.',
          ephemeral: true,
        });
        return;
      }
    }

    // 4. Execution Guard & Telemetry Wrap
    try {
      if (handlerTarget) {
        await handlerTarget.execute(ctx);
      } else if (rootCommand.execute) {
        await rootCommand.execute(ctx);
      }
    } catch (error) {
      console.error(`Execution failure in /${interaction.commandName} ${groupName ?? ''} ${subName ?? ''}:`, error);
      const payload = {
        content: 'An unexpected internal error occurred while processing this command.',
        ephemeral: true,
      };
      try {
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp(payload).catch(() => {});
        } else {
          await interaction.reply(payload).catch(() => {});
        }
      } catch (replyErr) {
        console.warn(`[CommandRegistry] Could not send error feedback for /${interaction.commandName}:`, (replyErr as Error).message);
      }
    }
  }
}
