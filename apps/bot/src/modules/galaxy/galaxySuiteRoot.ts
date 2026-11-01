import {
  SlashCommandBuilder,
  ApplicationIntegrationType,
  InteractionContextType,
  AttachmentBuilder,
  PermissionFlagsBits,
} from 'discord.js';
import { EnterpriseSlashCommand, SubcommandHandler, SubcommandGroupHandler } from '../../registry/commandTypes';
import { GalaxyCardRenderer } from './cardRenderer';
import { GalaxyCasinoEconomy } from './casinoEconomy';
import { prisma, MatchType } from '@hugebot/database';

const cardRenderer = new GalaxyCardRenderer();
const casino = new GalaxyCasinoEconomy();

const builder = new SlashCommandBuilder()
  .setName('galaxy')
  .setDescription('Galaxy Bot Engagement, Visuals & Casino Suite')
  .addSubcommandGroup((group) =>
    group
      .setName('visuals')
      .setDescription('Card rendering and graphics')
      .addSubcommand((sub) =>
        sub
          .setName('rankcard')
          .setDescription('Generate high-res dynamic rank card')
          .addUserOption((opt) => opt.setName('user').setDescription('Target user').setRequired(false))
      )
  )
  .addSubcommandGroup((group) =>
    group
      .setName('casino')
      .setDescription('Virtual mini-games and gambling')
      .addSubcommand((sub) =>
        sub
          .setName('coinflip')
          .setDescription('Gamble credits on a coin toss')
          .addIntegerOption((opt) => opt.setName('bet').setDescription('Amount of credits').setRequired(true))
          .addStringOption((opt) =>
            opt.setName('side').setDescription('Heads or Tails').setRequired(true).addChoices(
              { name: 'Heads', value: 'heads' },
              { name: 'Tails', value: 'tails' }
            )
          )
      )
      .addSubcommand((sub) =>
        sub
          .setName('slots')
          .setDescription('Spin the virtual slot machine')
          .addIntegerOption((opt) => opt.setName('bet').setDescription('Amount to wager').setRequired(true))
      )
  )
  .addSubcommandGroup((group) =>
    group
      .setName('responder')
      .setDescription('Auto-responder configuration')
      .addSubcommand((sub) =>
        sub
          .setName('add')
          .setDescription('Add a new auto-responder trigger')
          .addStringOption((opt) => opt.setName('trigger').setDescription('Trigger keyword').setRequired(true))
          .addStringOption((opt) => opt.setName('reply').setDescription('Bot response').setRequired(true))
          .addStringOption((opt) =>
            opt.setName('match_type').setDescription('Match algorithm').addChoices(
              { name: 'Exact Match', value: 'EXACT' },
              { name: 'Contains', value: 'CONTAINS' },
              { name: 'Regex', value: 'REGEX' }
            )
          )
      )
  );

const rankCardHandler: SubcommandHandler = {
  name: 'rankcard',
  description: 'Generate high-res dynamic rank card',
  execute: async ({ interaction, guildId }) => {
    const user = interaction.options.getUser('user') ?? interaction.user;
    await interaction.deferReply();

    const progress = await prisma.levelProgress.findUnique({
      where: { userId_guildId: { userId: user.id, guildId: guildId ?? 'global' } },
    });

    const level = progress?.currentLevel ?? 1;
    const currentXp = Number(progress?.totalXp ?? 50n);
    const requiredXp = level * 300;

    const buffer = await cardRenderer.renderRankCard({
      username: user.username,
      avatarUrl: user.displayAvatarURL({ extension: 'png' }),
      currentLevel: level,
      currentXp,
      requiredXp,
      rankPosition: 1,
    });

    const attachment = new AttachmentBuilder(buffer, { name: 'rank-card.png' });
    await interaction.editReply({ files: [attachment] });
  },
};

const coinflipHandler: SubcommandHandler = {
  name: 'coinflip',
  description: 'Gamble credits on a coin toss',
  execute: async ({ interaction, invokerId }) => {
    const bet = BigInt(interaction.options.getInteger('bet', true));
    const side = interaction.options.getString('side', true) as 'heads' | 'tails';

    try {
      const result = await casino.coinflip(invokerId, bet, side);
      await interaction.reply({
        content: `🪙 **COINFLIP**: ${result.details} ${result.won ? `(+🪙 ${result.payout.toLocaleString()})` : `(-🪙 ${bet.toLocaleString()})`}`,
      });
    } catch (err) {
      await interaction.reply({ content: (err as Error).message, ephemeral: true });
    }
  },
};

const slotsHandler: SubcommandHandler = {
  name: 'slots',
  description: 'Spin the virtual slot machine',
  execute: async ({ interaction, invokerId }) => {
    const bet = BigInt(interaction.options.getInteger('bet', true));

    try {
      const result = await casino.slots(invokerId, bet);
      await interaction.reply({
        content: `🎰 **SLOTS**: ${result.details} ${result.won ? `(+🪙 ${result.payout.toLocaleString()})` : `(-🪙 ${bet.toLocaleString()})`}`,
      });
    } catch (err) {
      await interaction.reply({ content: (err as Error).message, ephemeral: true });
    }
  },
};

const responderAddHandler: SubcommandHandler = {
  name: 'add',
  description: 'Add auto-responder trigger',
  requiredPermissions: [PermissionFlagsBits.ManageGuild],
  execute: async ({ interaction, guildId }) => {
    if (!guildId) return;
    await interaction.deferReply({ ephemeral: true });

    const trigger = interaction.options.getString('trigger', true);
    const reply = interaction.options.getString('reply', true);
    const matchType = (interaction.options.getString('match_type') as MatchType) ?? MatchType.EXACT;

    await prisma.autoResponder.create({
      data: {
        guildId,
        triggerText: trigger,
        matchType,
        responseJson: { text: reply },
      },
    });

    await interaction.editReply({
      content: `✅ Added auto-responder trigger: \`${trigger}\` [${matchType}] -> "${reply}"`,
    });
  },
};

const visualsGroup: SubcommandGroupHandler = {
  name: 'visuals',
  description: 'Card rendering',
  subcommands: new Map([['rankcard', rankCardHandler]]),
};

const casinoGroup: SubcommandGroupHandler = {
  name: 'casino',
  description: 'Gambling suite',
  subcommands: new Map([
    ['coinflip', coinflipHandler],
    ['slots', slotsHandler],
  ]),
};

const responderGroup: SubcommandGroupHandler = {
  name: 'responder',
  description: 'Auto-responder configuration',
  subcommands: new Map([['add', responderAddHandler]]),
};

export const galaxySuiteCommand: EnterpriseSlashCommand = {
  name: 'galaxy',
  description: 'Galaxy Bot Engagement, Visuals & Casino Suite',
  integrationTypes: [ApplicationIntegrationType.GuildInstall],
  contexts: [InteractionContextType.Guild],
  builder,
  groups: new Map([
    ['visuals', visualsGroup],
    ['casino', casinoGroup],
    ['responder', responderGroup],
  ]),
  rootSubcommands: new Map(),
};
