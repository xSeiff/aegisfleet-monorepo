import {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  ModalSubmitInteraction,
  EmbedBuilder,
  TextChannel,
  ChannelType,
  PermissionFlagsBits,
} from 'discord.js';
import { prisma, TicketStatus } from '@hugebot/database';

export class TicketIntakeModals {
  public createModal(panelId: string, title: string): ModalBuilder {
    const modal = new ModalBuilder()
      .setCustomId(`ticket_modal:${panelId}`)
      .setTitle(title.slice(0, 45));

    const subjectInput = new TextInputBuilder()
      .setCustomId('subject')
      .setLabel('Subject / Reason')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('Briefly summarize your request')
      .setRequired(true)
      .setMaxLength(100);

    const detailsInput = new TextInputBuilder()
      .setCustomId('details')
      .setLabel('Detailed Explanation')
      .setStyle(TextInputStyle.Paragraph)
      .setPlaceholder('Please provide full context and relevant links...')
      .setRequired(true)
      .setMaxLength(1000);

    modal.addComponents(
      new ActionRowBuilder<TextInputBuilder>().addComponents(subjectInput),
      new ActionRowBuilder<TextInputBuilder>().addComponents(detailsInput)
    );

    return modal;
  }

  public async handleModalSubmit(interaction: ModalSubmitInteraction): Promise<void> {
    const [, panelId] = interaction.customId.split(':');
    const guild = interaction.guild;
    if (!guild) return;

    await interaction.deferReply({ ephemeral: true });

    const subject = interaction.fields.getTextInputValue('subject');
    const details = interaction.fields.getTextInputValue('details');

    const panel = await prisma.ticketPanel.findUnique({
      where: { id: panelId },
    });

    const ticketCount = await prisma.ticket.count({ where: { guildId: guild.id } });
    const ticketNumber = ticketCount + 1;
    const prefix = panel?.ticketPrefix || 'ticket';

    const ticketChannel = await guild.channels.create({
      name: `${prefix}-${ticketNumber.toString().padStart(4, '0')}`,
      type: ChannelType.GuildText,
      parent: panel?.categoryId || undefined,
      permissionOverwrites: [
        { id: guild.id, deny: [PermissionFlagsBits.ViewChannel] },
        { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.AttachFiles] },
      ],
    });

    await prisma.ticket.create({
      data: {
        guildId: guild.id,
        ticketNumber,
        channelId: ticketChannel.id,
        creatorUserId: interaction.user.id,
        categoryName: panel?.title || 'General Support',
        status: TicketStatus.OPEN,
      },
    });

    const headerEmbed = new EmbedBuilder()
      .setTitle(`🎫 Ticket #${ticketNumber} - ${subject}`)
      .setDescription(`Created by <@${interaction.user.id}>\n\n**Details:**\n${details}`)
      .setColor(0x5865f2)
      .setFooter({ text: 'Staff can claim this ticket with /ticketsuite manage claim' })
      .setTimestamp();

    await ticketChannel.send({ embeds: [headerEmbed] });

    await interaction.editReply({
      content: `✅ Your ticket has been opened: <#${ticketChannel.id}>`,
    });
  }
}
