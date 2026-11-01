import { TextChannel, Message } from 'discord.js';

export interface PurgeFilterOptions {
  count: number; // 1 - 1000
  botsOnly?: boolean;
  humansOnly?: boolean;
  targetUserId?: string;
  attachmentsOnly?: boolean;
  linksOnly?: boolean;
  regexPattern?: string;
  beforeMessageId?: string;
  afterMessageId?: string;
}

export class AdvancedPurgeEngine {
  public async executePurge(channel: TextChannel, options: PurgeFilterOptions): Promise<number> {
    let totalDeleted = 0;
    let remaining = Math.min(options.count, 1000);
    let lastId = options.beforeMessageId;

    const regex = options.regexPattern ? new RegExp(options.regexPattern, 'i') : null;
    const urlRegex = /(https?:\/\/[^\s]+)/i;

    while (remaining > 0) {
      const fetchLimit = Math.min(remaining, 100);
      const messages = await channel.messages.fetch({
        limit: fetchLimit,
        before: lastId,
        after: options.afterMessageId,
      });

      if (messages.size === 0) break;

      const filtered = messages.filter((msg: Message) => {
        // Discord API constraint: messages older than 14 days cannot be bulk deleted
        const isOlderThan14Days = Date.now() - msg.createdTimestamp > 14 * 24 * 60 * 60 * 1000;
        if (isOlderThan14Days) return false;

        if (options.botsOnly && !msg.author.bot) return false;
        if (options.humansOnly && msg.author.bot) return false;
        if (options.targetUserId && msg.author.id !== options.targetUserId) return false;
        if (options.attachmentsOnly && msg.attachments.size === 0) return false;
        if (options.linksOnly && !urlRegex.test(msg.content)) return false;
        if (regex && !regex.test(msg.content)) return false;

        return true;
      });

      if (filtered.size > 0) {
        const deleted = await channel.bulkDelete(filtered, true);
        totalDeleted += deleted.size;
      }

      lastId = messages.last()?.id;
      remaining -= fetchLimit;

      // Small pause to prevent hitting Discord bulkDelete ratelimits
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    return totalDeleted;
  }
}
