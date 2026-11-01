import {
  SlashCommandBuilder,
  ApplicationIntegrationType,
  InteractionContextType,
  ChannelType,
  PermissionFlagsBits,
  EmbedBuilder,
} from 'discord.js';
import { EnterpriseSlashCommand, SubcommandHandler, SubcommandGroupHandler } from '../../registry/commandTypes';
import { prisma, TicketStatus } from '@hugebot/database';

const builder = new SlashCommandBuilder()
  .setName('tickets')
  .setDescription('Interactive Support & Ticket Studio Suite')
  .addSubcommandGroup((group) =>
    group
      .setName('manage')
      .setDescription('Ticket operations')
      .addSubcommand((sub) =>
        sub
          .setName('open')
          .setDescription('Open a new support inquiry')
          .addStringOption((opt) => opt.setName('subject').setDescription('Brief description of issue').setRequired(true))
      )
      .addSubcommand((sub) =>
        sub
          .setName('close')
          .setDescription('Resolve and close this ticket')
          .addStringOption((opt) => opt.setName('reason').setDescription('Closure summary').setRequired(false))
      )
  );

const openHandler: SubcommandHandler = {
  name: 'open',
  description: 'Open a new support inquiry',
  cooldownSeconds: 10,
  execute: async ({ interaction, guildId, invokerId }) => {
    if (!guildId || !interaction.guild) {
      await interaction.reply({ content: 'Tickets can only be created within a server.', ephemeral: true });
      return;
    }

    const subject = interaction.options.getString('subject', true);
    await interaction.deferReply({ ephemeral: true });

    const ticketCount = await prisma.ticket.count({ where: { guildId } });
    const ticketNumber = ticketCount + 1;

    // Create private ticket channel
    const ticketChannel = await interaction.guild.channels.create({
      name: `ticket-${ticketNumber.toString().padStart(4, '0')}`,
      type: ChannelType.GuildText,
      permissionOverwrites: [
        { id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
        { id: invokerId, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.AttachFiles] },
      ],
    });

    const ticket = await prisma.ticket.create({
      data: {
        guildId,
        ticketNumber,
        channelId: ticketChannel.id,
        creatorUserId: invokerId,
        categoryName: 'General Support',
        status: TicketStatus.OPEN,
      },
    });

    const welcomeEmbed = new EmbedBuilder()
      .setTitle(`Support Ticket #${ticket.ticketNumber}`)
      .setDescription(`Welcome <@${invokerId}>. Staff will assist you shortly.`)
      .addFields({ name: 'Subject', value: subject })
      .setColor(0x3498db)
      .setTimestamp();

    await ticketChannel.send({ embeds: [welcomeEmbed] });

    await interaction.editReply({
      content: `Your ticket has been created at <#${ticketChannel.id}>.`,
    });
  },
};

const closeHandler: SubcommandHandler = {
  name: 'close',
  description: 'Resolve and close this ticket',
  cooldownSeconds: 3,
  execute: async ({ interaction, channelId }) => {
    const ticket = await prisma.ticket.findUnique({
      where: { channelId },
    });

    if (!ticket) {
      await interaction.reply({ content: 'This channel is not an active ticket.', ephemeral: true });
      return;
    }

    const reason = interaction.options.getString('reason') ?? 'Resolved by staff';

    await prisma.ticket.update({
      where: { channelId },
      data: {
        status: TicketStatus.CLOSED,
        closedAt: new Date(),
      },
    });

    await interaction.reply({ content: `Ticket marked as resolved. Reason: ${reason}. Channel will be purged in 5 seconds.` });

    setTimeout(async () => {
      const channel = interaction.channel;
      if (channel && 'delete' in channel) {
        await channel.delete().catch(() => null);
      }
    }, 5000);
  },
};

const manageGroup: SubcommandGroupHandler = {
  name: 'manage',
  description: 'Ticket operations',
  subcommands: new Map([
    ['open', openHandler],
    ['close', closeHandler],
  ]),
};

export const ticketsCommand: EnterpriseSlashCommand = {
  name: 'tickets',
  description: 'Interactive Support & Ticket Studio Suite',
  integrationTypes: [ApplicationIntegrationType.GuildInstall],
  contexts: [InteractionContextType.Guild],
  builder,
  groups: new Map([['manage', manageGroup]]),
  rootSubcommands: new Map(),
};
