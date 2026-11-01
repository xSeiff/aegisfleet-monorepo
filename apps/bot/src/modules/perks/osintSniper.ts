import { Message, MessageReaction, User } from 'discord.js';
import Redis from 'ioredis';
import { prisma } from '@hugebot/database';

export interface SnipedMessage {
  content: string;
  authorId: string;
  authorTag: string;
  avatarUrl: string;
  attachmentUrl?: string;
  timestamp: number;
}

export class GalaxyOsintAndSniper {
  private redis: Redis;

  constructor(redisClient: Redis) {
    this.redis = redisClient;
  }

  // --- Sniper Systems ---
  public async cacheDeletedMessage(message: Message): Promise<void> {
    if (!message.guild || message.author.bot) return;

    const data: SnipedMessage = {
      content: message.content,
      authorId: message.author.id,
      authorTag: message.author.tag,
      avatarUrl: message.author.displayAvatarURL(),
      attachmentUrl: message.attachments.first()?.url,
      timestamp: Date.now(),
    };

    await this.redis.set(`snipe:deleted:${message.channel.id}`, JSON.stringify(data), 'EX', 86400);
  }

  public async getSnipedMessage(channelId: string): Promise<SnipedMessage | null> {
    const raw = await this.redis.get(`snipe:deleted:${channelId}`);
    return raw ? JSON.parse(raw) : null;
  }

  public async cacheEditedMessage(oldMessage: Message, newMessage: Message): Promise<void> {
    if (!oldMessage.guild || oldMessage.author.bot || oldMessage.content === newMessage.content) return;

    const data = {
      oldContent: oldMessage.content,
      newContent: newMessage.content,
      authorTag: oldMessage.author.tag,
      timestamp: Date.now(),
    };

    await this.redis.set(`snipe:edited:${oldMessage.channel.id}`, JSON.stringify(data), 'EX', 86400);
  }

  public async getEditedMessage(channelId: string) {
    const raw = await this.redis.get(`snipe:edited:${channelId}`);
    return raw ? JSON.parse(raw) : null;
  }

  // --- OSINT User History Archive ---
  public async trackAvatarChange(user: User, oldAvatarUrl: string): Promise<void> {
    await prisma.userHistoryArchive.create({
      data: {
        userId: user.id,
        historyType: 'AVATAR',
        oldValue: oldAvatarUrl,
      },
    });
  }

  public async trackUsernameChange(user: User, oldUsername: string): Promise<void> {
    await prisma.userHistoryArchive.create({
      data: {
        userId: user.id,
        historyType: 'USERNAME',
        oldValue: oldUsername,
      },
    });
  }

  public async getUserHistory(userId: string, type: 'AVATAR' | 'USERNAME' | 'BIO'): Promise<string[]> {
    const archives = await prisma.userHistoryArchive.findMany({
      where: { userId, historyType: type },
      orderBy: { changedAt: 'desc' },
      take: 10,
    });
    return archives.map((a) => a.oldValue);
  }
}
