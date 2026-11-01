import {
  SlashCommandBuilder,
  ApplicationIntegrationType,
  InteractionContextType,
  EmbedBuilder,
} from 'discord.js';
import { EnterpriseSlashCommand, SubcommandHandler, SubcommandGroupHandler } from '../../registry/commandTypes';
import { prisma } from '@hugebot/database';

const builder = new SlashCommandBuilder()
  .setName('level')
  .setDescription('Leveling, Activity & Gamification Suite')
  .addSubcommandGroup((group) =>
    group
      .setName('rank')
      .setDescription('Individual rank statistics')
      .addSubcommand((sub) =>
        sub
          .setName('view')
          .setDescription('View current XP, level, and card progression')
          .addUserOption((opt) => opt.setName('user').setDescription('Target user').setRequired(false))
      )
  )
  .addSubcommandGroup((group) =>
    group
      .setName('leaderboard')
      .setDescription('Server level leaderboards')
      .addSubcommand((sub) =>
        sub
          .setName('text')
          .setDescription('Top active chatters by total XP')
      )
  );

const rankViewHandler: SubcommandHandler = {
  name: 'view',
  description: 'View current XP, level, and card progression',
  cooldownSeconds: 3,
  execute: async ({ interaction, guildId }) => {
    if (!guildId) {
      await interaction.reply({ content: 'Leveling is tied to a server context.', ephemeral: true });
      return;
    }

    const targetUser = interaction.options.getUser('user') ?? interaction.user;

    await prisma.user.upsert({
      where: { id: targetUser.id },
      create: { id: targetUser.id, username: targetUser.username },
      update: { username: targetUser.username },
    });

    const progress = await prisma.levelProgress.upsert({
      where: { userId_guildId: { userId: targetUser.id, guildId } },
      create: {
        userId: targetUser.id,
        guildId,
        totalXp: 100n,
        currentLevel: 1,
      },
      update: {},
    });

    const nextLevelXp = BigInt(progress.currentLevel * 300);

    const embed = new EmbedBuilder()
      .setTitle(`${targetUser.username}'s Level Status`)
      .setColor(0x5865f2)
      .setThumbnail(targetUser.displayAvatarURL())
      .addFields(
        { name: 'Current Level', value: `Level ${progress.currentLevel}`, inline: true },
        { name: 'Total XP', value: `${progress.totalXp.toLocaleString()} XP`, inline: true },
        { name: 'Next Level At', value: `${nextLevelXp.toLocaleString()} XP`, inline: true },
        { name: 'Prestige Tier', value: `Tier ${progress.prestigeTier}`, inline: true }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};

const leaderboardTextHandler: SubcommandHandler = {
  name: 'text',
  description: 'Top active chatters by total XP',
  cooldownSeconds: 5,
  execute: async ({ interaction, guildId }) => {
    if (!guildId) {
      await interaction.reply({ content: 'Leaderboard is available only in a server context.', ephemeral: true });
      return;
    }

    const topUsers = await prisma.levelProgress.findMany({
      where: { guildId },
      orderBy: { totalXp: 'desc' },
      take: 10,
      include: { user: true },
    });

    if (topUsers.length === 0) {
      await interaction.reply({ content: 'No activity data recorded in this server yet.' });
      return;
    }

    const leaderboardString = topUsers
      .map((p, idx) => `**#${idx + 1}** <@${p.userId}> — Level ${p.currentLevel} (${p.totalXp.toLocaleString()} XP)`)
      .join('\n');

    const embed = new EmbedBuilder()
      .setTitle('🏆 Server Activity Leaderboard')
      .setColor(0xffd700)
      .setDescription(leaderboardString)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};

const rankGroup: SubcommandGroupHandler = {
  name: 'rank',
  description: 'Individual rank statistics',
  subcommands: new Map([['view', rankViewHandler]]),
};

const leaderboardGroup: SubcommandGroupHandler = {
  name: 'leaderboard',
  description: 'Server level leaderboards',
  subcommands: new Map([['text', leaderboardTextHandler]]),
};

export const levelCommand: EnterpriseSlashCommand = {
  name: 'level',
  description: 'Leveling, Activity & Gamification Suite',
  integrationTypes: [ApplicationIntegrationType.GuildInstall],
  contexts: [InteractionContextType.Guild],
  builder,
  groups: new Map([
    ['rank', rankGroup],
    ['leaderboard', leaderboardGroup],
  ]),
  rootSubcommands: new Map(),
};
