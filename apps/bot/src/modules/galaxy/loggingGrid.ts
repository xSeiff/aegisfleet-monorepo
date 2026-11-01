import {
  Message,
  GuildMember,
  VoiceState,
  EmbedBuilder,
  TextChannel,
} from 'discord.js';
import { prisma } from '@hugebot/database';

export class GalaxyLoggingGrid {
  public async logMessageDelete(message: Message): Promise<void> {
    if (!message.guild || message.author?.bot) return;

    const grid = await prisma.loggingChannelGrid.findUnique({
      where: { guildId: message.guild.id },
    });

    if (!grid?.messageDeleteChannelId) return;
    const channel = message.guild.channels.cache.get(grid.messageDeleteChannelId) as TextChannel;
    if (!channel) return;

    const embed = new EmbedBuilder()
      .setTitle('🗑️ Message Deleted')
      .setColor(0xe74c3c)
      .addFields(
        { name: 'Author', value: `<@${message.author.id}> (${message.author.tag})`, inline: true },
        { name: 'Channel', value: `<#${message.channel.id}>`, inline: true },
        { name: 'Content', value: message.content || '*(No text content)*' }
      )
      .setTimestamp();

    await channel.send({ embeds: [embed] }).catch(() => null);
  }

  public async logMessageEdit(oldMessage: Message, newMessage: Message): Promise<void> {
    if (!oldMessage.guild || oldMessage.author?.bot || oldMessage.content === newMessage.content) return;

    const grid = await prisma.loggingChannelGrid.findUnique({
      where: { guildId: oldMessage.guild.id },
    });

    if (!grid?.messageEditChannelId) return;
    const channel = oldMessage.guild.channels.cache.get(grid.messageEditChannelId) as TextChannel;
    if (!channel) return;

    const embed = new EmbedBuilder()
      .setTitle('✏️ Message Edited')
      .setColor(0xf39c12)
      .addFields(
        { name: 'Author', value: `<@${oldMessage.author.id}>`, inline: true },
        { name: 'Channel', value: `<#${oldMessage.channel.id}>`, inline: true },
        { name: 'Before', value: oldMessage.content || '*(Empty)*' },
        { name: 'After', value: newMessage.content || '*(Empty)*' }
      )
      .setTimestamp();

    await channel.send({ embeds: [embed] }).catch(() => null);
  }

  public async logVoiceStateUpdate(oldState: VoiceState, newState: VoiceState): Promise<void> {
    const guild = oldState.guild;
    const member = newState.member;
    if (!member || member.user.bot) return;

    const grid = await prisma.loggingChannelGrid.findUnique({
      where: { guildId: guild.id },
    });

    if (!grid?.voiceLogChannelId) return;
    const channel = guild.channels.cache.get(grid.voiceLogChannelId) as TextChannel;
    if (!channel) return;

    let eventType = '';
    if (!oldState.channelId && newState.channelId) {
      eventType = `Joined voice channel <#${newState.channelId}>`;
    } else if (oldState.channelId && !newState.channelId) {
      eventType = `Left voice channel <#${oldState.channelId}>`;
    } else if (oldState.channelId && newState.channelId && oldState.channelId !== newState.channelId) {
      eventType = `Moved from <#${oldState.channelId}> to <#${newState.channelId}>`;
    }

    if (eventType) {
      const embed = new EmbedBuilder()
        .setTitle('🔊 Voice Activity Update')
        .setColor(0x3498db)
        .setDescription(`<@${member.id}>: ${eventType}`)
        .setTimestamp();

      await channel.send({ embeds: [embed] }).catch(() => null);
    }
  }
}
