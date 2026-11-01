import {
  VoiceState,
  ChannelType,
  PermissionFlagsBits,
  Message,
  EmbedBuilder,
  TextChannel,
} from 'discord.js';
import { prisma } from '@hugebot/database';

export class GalaxyVoiceAndUtilities {
  // --- Join-to-Create Dynamic Voice ---
  public async handleVoiceState(oldState: VoiceState, newState: VoiceState): Promise<void> {
    const guild = newState.guild;
    const member = newState.member;
    if (!member || member.user.bot) return;

    const config = await prisma.joinToCreateConfig.findUnique({
      where: { guildId: guild.id },
    });

    // Joined Hub Channel
    if (config && newState.channelId === config.hubChannelId) {
      const channelName = `${member.user.username}'s Room`;
      const tempChannel = await guild.channels.create({
        name: channelName,
        type: ChannelType.GuildVoice,
        parent: config.targetCategoryId || undefined,
        bitrate: config.defaultBitrate,
        userLimit: config.defaultUserLimit,
        permissionOverwrites: [
          {
            id: member.id,
            allow: [
              PermissionFlagsBits.ManageChannels,
              PermissionFlagsBits.MoveMembers,
              PermissionFlagsBits.MuteMembers,
              PermissionFlagsBits.DeafenMembers,
            ],
          },
        ],
      });

      // Move member into their new room
      await member.voice.setChannel(tempChannel).catch(() => null);
    }

    // Left a temporary channel -> Cleanup if empty
    if (oldState.channel && oldState.channel.members.size === 0 && oldState.channelId !== config?.hubChannelId) {
      if (oldState.channel.name.endsWith("'s Room")) {
        await oldState.channel.delete('Join-to-Create: Temporary voice channel vacated').catch(() => null);
      }
    }
  }

  // --- Sticky Messages ---
  public async handleStickyMessage(message: Message): Promise<void> {
    if (!message.guild || message.author.bot) return;

    const sticky = await prisma.stickyMessage.findUnique({
      where: { channelId: message.channel.id },
    });

    if (!sticky) return;

    // Delete old message if exists
    if (sticky.lastMessageId && 'messages' in message.channel) {
      const old = await message.channel.messages.fetch(sticky.lastMessageId).catch(() => null);
      if (old) await old.delete().catch(() => null);
    }

    // Repost sticky message at bottom of feed
    if ('send' in message.channel) {
      const embed = new EmbedBuilder()
        .setDescription(sticky.messageContent)
        .setColor(0x34495e)
        .setFooter({ text: '📌 Sticky Announcement' });

      const sent = await message.channel.send({ embeds: [embed] });
      await prisma.stickyMessage.update({
        where: { channelId: message.channel.id },
        data: { lastMessageId: sent.id },
      });
    }
  }

  // --- AFK Status Tracker ---
  public async setAfk(guildId: string, userId: string, reason = 'AFK'): Promise<void> {
    await prisma.afkStatus.upsert({
      where: { guildId_userId: { guildId, userId } },
      create: { guildId, userId, reason },
      update: { reason, afkSince: new Date() },
    });
  }

  public async checkMentionsForAfk(message: Message): Promise<void> {
    if (!message.guild || message.author.bot) return;

    // Remove author's AFK if they speak
    const authorAfk = await prisma.afkStatus.findUnique({
      where: { guildId_userId: { guildId: message.guild.id, userId: message.author.id } },
    });
    if (authorAfk) {
      await prisma.afkStatus.delete({
        where: { guildId_userId: { guildId: message.guild.id, userId: message.author.id } },
      });
      await message.reply({ content: `👋 Welcome back <@${message.author.id}>! Your AFK status has been cleared.` }).catch(() => null);
    }

    // Check if message mentions someone who is AFK
    if (message.mentions.users.size > 0) {
      for (const [id] of message.mentions.users) {
        const afk = await prisma.afkStatus.findUnique({
          where: { guildId_userId: { guildId: message.guild.id, userId: id } },
        });
        if (afk) {
          const since = `<t:${Math.floor(afk.afkSince.getTime() / 1000)}:R>`;
          await message.reply({
            content: `💤 <@${id}> is currently AFK (${since}): **${afk.reason}**`,
          }).catch(() => null);
        }
      }
    }
  }
}
