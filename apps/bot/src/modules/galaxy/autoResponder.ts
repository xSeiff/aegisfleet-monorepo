import { Message } from 'discord.js';
import { prisma, MatchType } from '@hugebot/database';

export class GalaxyAutoResponder {
  public async handleMessage(message: Message): Promise<boolean> {
    if (!message.guild || message.author.bot) return false;

    const responders = await prisma.autoResponder.findMany({
      where: { guildId: message.guild.id },
    });

    const content = message.content.trim();

    for (const ar of responders) {
      let matched = false;

      if (ar.matchType === MatchType.EXACT) {
        matched = content.toLowerCase() === ar.triggerText.toLowerCase();
      } else if (ar.matchType === MatchType.CONTAINS) {
        matched = content.toLowerCase().includes(ar.triggerText.toLowerCase());
      } else if (ar.matchType === MatchType.REGEX) {
        try {
          const regex = new RegExp(ar.triggerText, 'i');
          matched = regex.test(content);
        } catch {
          matched = false;
        }
      }

      if (matched) {
        const responseData = ar.responseJson as any;
        const replyText = typeof responseData === 'string' ? responseData : responseData?.text || 'Automated response';

        await message.reply({
          content: replyText,
        }).catch(() => null);

        if (ar.autoReactionEmoji) {
          await message.react(ar.autoReactionEmoji).catch(() => null);
        }

        return true;
      }
    }

    return false;
  }
}
