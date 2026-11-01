import {
  SlashCommandBuilder,
  ApplicationIntegrationType,
  InteractionContextType,
  EmbedBuilder,
} from 'discord.js';
import { EnterpriseSlashCommand, SubcommandHandler, SubcommandGroupHandler } from '../../registry/commandTypes';
import { prisma } from '@hugebot/database';

const builder = new SlashCommandBuilder()
  .setName('social')
  .setDescription('Social, Engagement, Polls & Minigames Suite')
  .addSubcommandGroup((group) =>
    group
      .setName('poll')
      .setDescription('Native interactive polls')
      .addSubcommand((sub) =>
        sub
          .setName('create')
          .setDescription('Create a structured community poll')
          .addStringOption((opt) => opt.setName('question').setDescription('Poll inquiry').setRequired(true))
          .addStringOption((opt) => opt.setName('option_1').setDescription('First choice').setRequired(true))
          .addStringOption((opt) => opt.setName('option_2').setDescription('Second choice').setRequired(true))
      )
  )
  .addSubcommandGroup((group) =>
    group
      .setName('reputation')
      .setDescription('Community endorsement')
      .addSubcommand((sub) =>
        sub
          .setName('give')
          .setDescription('Award reputation point to a helpful user')
          .addUserOption((opt) => opt.setName('user').setDescription('Recipient').setRequired(true))
      )
  );

const pollCreateHandler: SubcommandHandler = {
  name: 'create',
  description: 'Create a structured community poll',
  cooldownSeconds: 5,
  execute: async ({ interaction }) => {
    const question = interaction.options.getString('question', true);
    const opt1 = interaction.options.getString('option_1', true);
    const opt2 = interaction.options.getString('option_2', true);

    const embed = new EmbedBuilder()
      .setTitle(`📊 Community Poll: ${question}`)
      .setDescription(`1️⃣ ${opt1}\n\n2️⃣ ${opt2}`)
      .setColor(0x34495e)
      .setFooter({ text: 'React with emojis to vote' });

    const msg = await interaction.reply({ embeds: [embed], fetchReply: true });
    await msg.react('1️⃣');
    await msg.react('2️⃣');
  },
};

const repGiveHandler: SubcommandHandler = {
  name: 'give',
  description: 'Award reputation point',
  cooldownSeconds: 60,
  execute: async ({ interaction, invokerId }) => {
    const targetUser = interaction.options.getUser('user', true);
    if (targetUser.id === invokerId) {
      await interaction.reply({ content: 'You cannot endorse yourself.', ephemeral: true });
      return;
    }

    const updated = await prisma.user.upsert({
      where: { id: targetUser.id },
      create: {
        id: targetUser.id,
        username: targetUser.username,
        globalReputation: 1,
      },
      update: {
        globalReputation: { increment: 1 },
      },
    });

    await interaction.reply({
      content: `🌟 <@${invokerId}> gave +1 reputation to <@${targetUser.id}>! (Total Rep: ${updated.globalReputation})`,
    });
  },
};

const pollGroup: SubcommandGroupHandler = {
  name: 'poll',
  description: 'Native interactive polls',
  subcommands: new Map([['create', pollCreateHandler]]),
};

const repGroup: SubcommandGroupHandler = {
  name: 'reputation',
  description: 'Community endorsement',
  subcommands: new Map([['give', repGiveHandler]]),
};

export const socialCommand: EnterpriseSlashCommand = {
  name: 'social',
  description: 'Social, Engagement, Polls & Minigames Suite',
  integrationTypes: [ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall],
  contexts: [InteractionContextType.Guild, InteractionContextType.BotDM],
  builder,
  groups: new Map([
    ['poll', pollGroup],
    ['reputation', repGroup],
  ]),
  rootSubcommands: new Map(),
};
