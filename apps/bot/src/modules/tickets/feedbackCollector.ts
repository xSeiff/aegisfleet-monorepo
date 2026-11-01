import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ButtonInteraction,
  EmbedBuilder,
  User,
} from 'discord.js';
import { prisma } from '@hugebot/database';

export class TicketFeedbackCollector {
  public async sendRatingSurvey(user: User, ticketId: string, ticketNumber: number, guildId: string, staffUserId: string): Promise<void> {
    const embed = new EmbedBuilder()
      .setTitle(`⭐ How was your support experience? (Ticket #${ticketNumber})`)
      .setDescription('Please rate the assistance provided by our staff team.')
      .setColor(0xf1c40f);

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setCustomId(`csat:${ticketId}:1`).setLabel('1 ⭐').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId(`csat:${ticketId}:2`).setLabel('2 ⭐').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId(`csat:${ticketId}:3`).setLabel('3 ⭐').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId(`csat:${ticketId}:4`).setLabel('4 ⭐').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId(`csat:${ticketId}:5`).setLabel('5 ⭐ (Excellent)').setStyle(ButtonStyle.Success)
    );

    await user.send({ embeds: [embed], components: [row] }).catch(() => null);
  }

  public async handleRatingButton(interaction: ButtonInteraction): Promise<void> {
    if (!interaction.customId.startsWith('csat:')) return;

    const [, ticketId, starStr] = interaction.customId.split(':');
    const stars = parseInt(starStr, 10);

    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      await interaction.reply({ content: 'Ticket reference not found.', ephemeral: true });
      return;
    }

    await prisma.ticketRating.upsert({
      where: { ticketId },
      create: {
        ticketId,
        guildId: ticket.guildId,
        staffUserId: ticket.assignedUserId || 'unassigned',
        creatorUserId: interaction.user.id,
        stars,
      },
      update: {
        stars,
      },
    });

    await interaction.reply({
      content: `Thank you for your feedback! You rated this support session **${stars}/5 stars**.`,
      ephemeral: true,
    });
  }
}
