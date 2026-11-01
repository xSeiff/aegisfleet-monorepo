import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ApplicationIntegrationType,
  InteractionContextType,
  EmbedBuilder,
} from 'discord.js';
import { EnterpriseSlashCommand, SubcommandHandler, SubcommandGroupHandler } from '../../registry/commandTypes';
import { prisma, ModerationActionType } from '@hugebot/database';

const builder = new SlashCommandBuilder()
  .setName('security')
  .setDescription('Enterprise Security, Raid-Defense & Moderation Suite')
  .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
  // Subcommand Group: action
  .addSubcommandGroup((group) =>
    group
      .setName('action')
      .setDescription('Moderation enforcement commands')
      .addSubcommand((sub) =>
        sub
          .setName('ban')
          .setDescription('Ban an abusive member')
          .addUserOption((opt) => opt.setName('user').setDescription('Target member').setRequired(true))
          .addStringOption((opt) => opt.setName('reason').setDescription('Case reason').setRequired(false))
          .addIntegerOption((opt) => opt.setName('delete_days').setDescription('Days of messages to purge').setRequired(false))
      )
      .addSubcommand((sub) =>
        sub
          .setName('timeout')
          .setDescription('Apply a temporary communication timeout')
          .addUserOption((opt) => opt.setName('user').setDescription('Target member').setRequired(true))
          .addIntegerOption((opt) => opt.setName('duration_minutes').setDescription('Minutes of timeout').setRequired(true))
          .addStringOption((opt) => opt.setName('reason').setDescription('Case reason').setRequired(false))
      )
  )
  // Subcommand Group: automod
  .addSubcommandGroup((group) =>
    group
      .setName('automod')
      .setDescription('AutoMod rule engine')
      .addSubcommand((sub) =>
        sub
          .setName('regex_test')
          .setDescription('Test a regex pattern in sandbox')
          .addStringOption((opt) => opt.setName('pattern').setDescription('Regex string').setRequired(true))
          .addStringOption((opt) => opt.setName('sample').setDescription('Sample payload').setRequired(true))
      )
  );

const banHandler: SubcommandHandler = {
  name: 'ban',
  description: 'Ban an abusive member',
  requiredPermissions: [PermissionFlagsBits.BanMembers],
  cooldownSeconds: 3,
  execute: async ({ interaction, guildId, invokerId }) => {
    if (!guildId || !interaction.guild) {
      await interaction.reply({ content: 'This command can only be used in a server.', ephemeral: true });
      return;
    }

    const targetUser = interaction.options.getUser('user', true);
    const reason = interaction.options.getString('reason') ?? 'No reason provided';
    const deleteDays = interaction.options.getInteger('delete_days') ?? 0;

    const targetMember = await interaction.guild.members.fetch(targetUser.id).catch(() => null);
    if (targetMember && !targetMember.bannable) {
      await interaction.reply({ content: 'Cannot ban this member (role hierarchy violation).', ephemeral: true });
      return;
    }

    await interaction.deferReply();

    await interaction.guild.bans.create(targetUser.id, {
      reason,
      deleteMessageSeconds: deleteDays * 86400,
    });

    const modCase = await prisma.moderationLog.create({
      data: {
        guildId,
        action: ModerationActionType.BAN,
        targetUserId: targetUser.id,
        moderatorId: invokerId,
        reason,
      },
    });

    const embed = new EmbedBuilder()
      .setTitle(`Case #${modCase.caseId} | Ban Enforced`)
      .setColor(0xff3333)
      .addFields(
        { name: 'Target', value: `<@${targetUser.id}> (${targetUser.id})`, inline: true },
        { name: 'Moderator', value: `<@${invokerId}>`, inline: true },
        { name: 'Reason', value: reason, inline: false }
      )
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  },
};

const timeoutHandler: SubcommandHandler = {
  name: 'timeout',
  description: 'Apply timeout',
  requiredPermissions: [PermissionFlagsBits.ModerateMembers],
  cooldownSeconds: 2,
  execute: async ({ interaction, guildId, invokerId }) => {
    if (!guildId || !interaction.guild) {
      await interaction.reply({ content: 'Command only available in guilds.', ephemeral: true });
      return;
    }

    const targetUser = interaction.options.getUser('user', true);
    const minutes = interaction.options.getInteger('duration_minutes', true);
    const reason = interaction.options.getString('reason') ?? 'No reason provided';

    const member = await interaction.guild.members.fetch(targetUser.id).catch(() => null);
    if (!member || !member.moderatable) {
      await interaction.reply({ content: 'Cannot timeout member.', ephemeral: true });
      return;
    }

    await member.timeout(minutes * 60 * 1000, reason);

    const modCase = await prisma.moderationLog.create({
      data: {
        guildId,
        action: ModerationActionType.TIMEOUT,
        targetUserId: targetUser.id,
        moderatorId: invokerId,
        durationSeconds: BigInt(minutes * 60),
        reason,
      },
    });

    await interaction.reply({
      content: `Case #${modCase.caseId}: Timed out <@${targetUser.id}> for ${minutes} minute(s). Reason: ${reason}`,
    });
  },
};

const regexTestHandler: SubcommandHandler = {
  name: 'regex_test',
  description: 'Test a regex pattern in sandbox',
  cooldownSeconds: 1,
  execute: async ({ interaction }) => {
    const pattern = interaction.options.getString('pattern', true);
    const sample = interaction.options.getString('sample', true);

    try {
      const start = process.hrtime.bigint();
      const regex = new RegExp(pattern, 'i');
      const matched = regex.test(sample);
      const end = process.hrtime.bigint();
      const durationMs = Number(end - start) / 1_000_000;

      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle('AutoMod Heuristic Regex Test')
            .setColor(matched ? 0xff4444 : 0x44ff44)
            .addFields(
              { name: 'Pattern', value: `\`${pattern}\`` },
              { name: 'Match Result', value: matched ? '⚠️ Blocked (Matched)' : '✅ Allowed (Clean)' },
              { name: 'Evaluation Latency', value: `${durationMs.toFixed(3)} ms` }
            ),
        ],
      });
    } catch (err) {
      await interaction.reply({ content: `Invalid regular expression: ${(err as Error).message}`, ephemeral: true });
    }
  },
};

const actionGroup: SubcommandGroupHandler = {
  name: 'action',
  description: 'Moderation enforcement commands',
  subcommands: new Map([
    ['ban', banHandler],
    ['timeout', timeoutHandler],
  ]),
};

const automodGroup: SubcommandGroupHandler = {
  name: 'automod',
  description: 'AutoMod rule engine',
  subcommands: new Map([['regex_test', regexTestHandler]]),
};

export const securityCommand: EnterpriseSlashCommand = {
  name: 'security',
  description: 'Enterprise Security, Raid-Defense & Moderation Suite',
  integrationTypes: [ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall],
  contexts: [InteractionContextType.Guild, InteractionContextType.BotDM],
  builder,
  groups: new Map([
    ['action', actionGroup],
    ['automod', automodGroup],
  ]),
  rootSubcommands: new Map(),
};
