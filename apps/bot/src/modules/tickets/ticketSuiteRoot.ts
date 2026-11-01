import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ApplicationIntegrationType,
  InteractionContextType,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  TextChannel,
  AttachmentBuilder,
} from 'discord.js';
import { EnterpriseSlashCommand, SubcommandHandler, SubcommandGroupHandler } from '../../registry/commandTypes';
import { prisma } from '@hugebot/database';
import { HtmlTranscriptEngine } from './transcriptEngine';

const transcriptEngine = new HtmlTranscriptEngine();

const builder = new SlashCommandBuilder()
  .setName('ticketsuite')
  .setDescription('Galaxy Bot Ticket Support Suite')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
  .addSubcommandGroup((group) =>
    group
      .setName('panel')
      .setDescription('Deploy support panels')
      .addSubcommand((sub) =>
        sub
          .setName('deploy')
          .setDescription('Send a ticket panel embed with interactive buttons')
          .addStringOption((opt) => opt.setName('title').setDescription('Panel header').setRequired(true))
          .addStringOption((opt) => opt.setName('description').setDescription('Panel message').setRequired(true))
          .addChannelOption((opt) => opt.setName('channel').setDescription('Channel to deploy to').setRequired(true))
      )
  )
  .addSubcommandGroup((group) =>
    group
      .setName('manage')
      .setDescription('Staff controls for tickets')
      .addSubcommand((sub) =>
        sub
          .setName('claim')
          .setDescription('Claim ownership of this ticket')
      )
      .addSubcommand((sub) =>
        sub
          .setName('transcript')
          .setDescription('Export full HTML transcript of this ticket')
      )
  );

const panelDeployHandler: SubcommandHandler = {
  name: 'deploy',
  description: 'Deploy support panel',
  requiredPermissions: [PermissionFlagsBits.ManageChannels],
  execute: async ({ interaction, guildId }) => {
    if (!guildId) return;
    const title = interaction.options.getString('title', true);
    const description = interaction.options.getString('description', true);
    const targetChannel = interaction.options.getChannel('channel', true) as TextChannel;

    const panel = await prisma.ticketPanel.create({
      data: {
        guildId,
        title,
        description,
        channelId: targetChannel.id,
      },
    });

    const embed = new EmbedBuilder()
      .setTitle(title)
      .setDescription(description)
      .setColor(0x5865f2)
      .setFooter({ text: 'Click below to start an inquiry' });

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(`ticket_open:${panel.id}`)
        .setLabel('Open Ticket')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('📩')
    );

    const sentMessage = await targetChannel.send({ embeds: [embed], components: [row] });
    await prisma.ticketPanel.update({
      where: { id: panel.id },
      data: { messageId: sentMessage.id },
    });

    await interaction.reply({ content: `✅ Ticket panel deployed to <#${targetChannel.id}>.`, ephemeral: true });
  },
};

const claimHandler: SubcommandHandler = {
  name: 'claim',
  description: 'Claim ownership of ticket',
  execute: async ({ interaction, channelId, invokerId }) => {
    const ticket = await prisma.ticket.findUnique({ where: { channelId } });
    if (!ticket) {
      await interaction.reply({ content: 'This channel is not an active support ticket.', ephemeral: true });
      return;
    }

    await prisma.ticket.update({
      where: { channelId },
      data: { assignedUserId: invokerId, status: 'ASSIGNED' },
    });

    await interaction.reply({
      content: `🙋 Staff member <@${invokerId}> has claimed this ticket and will be your primary point of contact.`,
    });
  },
};

const transcriptHandler: SubcommandHandler = {
  name: 'transcript',
  description: 'Export HTML transcript',
  execute: async ({ interaction, channelId }) => {
    const ticket = await prisma.ticket.findUnique({ where: { channelId } });
    if (!ticket) {
      await interaction.reply({ content: 'This is not an active ticket channel.', ephemeral: true });
      return;
    }

    await interaction.deferReply();
    const html = await transcriptEngine.generateTranscript(interaction.channel as TextChannel, ticket.ticketNumber);
    const attachment = new AttachmentBuilder(Buffer.from(html, 'utf-8'), { name: `transcript-ticket-${ticket.ticketNumber}.html` });

    await interaction.editReply({
      content: `📁 HTML Transcript generated for Ticket #${ticket.ticketNumber}:`,
      files: [attachment],
    });
  },
};

const panelGroup: SubcommandGroupHandler = {
  name: 'panel',
  description: 'Deploy support panels',
  subcommands: new Map([['deploy', panelDeployHandler]]),
};

const manageGroup: SubcommandGroupHandler = {
  name: 'manage',
  description: 'Staff controls for tickets',
  subcommands: new Map([
    ['claim', claimHandler],
    ['transcript', transcriptHandler],
  ]),
};

export const ticketSuiteCommand: EnterpriseSlashCommand = {
  name: 'ticketsuite',
  description: 'Galaxy Bot Ticket Support Suite',
  integrationTypes: [ApplicationIntegrationType.GuildInstall],
  contexts: [InteractionContextType.Guild],
  builder,
  groups: new Map([
    ['panel', panelGroup],
    ['manage', manageGroup],
  ]),
  rootSubcommands: new Map(),
};
