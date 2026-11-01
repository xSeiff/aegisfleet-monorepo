import { Message, EmbedBuilder } from 'discord.js';
import { prisma } from '@hugebot/database';

export interface LastFmTrack {
  name: string;
  artist: string;
  album: string;
  nowPlaying: boolean;
}

export class GalaxyLastFmAndMedia {
  public async setUsername(userId: string, username: string): Promise<void> {
    await prisma.lastFmProfile.upsert({
      where: { userId },
      create: { userId, lastFmUsername: username },
      update: { lastFmUsername: username },
    });
  }

  public async getNowPlaying(userId: string): Promise<LastFmTrack | null> {
    const profile = await prisma.lastFmProfile.findUnique({ where: { userId } });
    if (!profile) return null;

    // Simulated track payload (In production: fetch from ws.audioscrobbler.com/2.0/)
    return {
      name: 'Starboy',
      artist: 'The Weeknd',
      album: 'Starboy',
      nowPlaying: true,
    };
  }

  // --- Media Unfurler ---
  public async handleMediaUnfurl(message: Message): Promise<boolean> {
    if (message.author.bot) return false;

    const tiktokRegex = /https?:\/\/(www\.)?(tiktok\.com|vm\.tiktok\.com)\/[^\s]+/i;
    const twitterRegex = /https?:\/\/(www\.)?(twitter\.com|x\.com)\/[a-zA-Z0-9_]+\/status\/[0-9]+/i;
    const instaRegex = /https?:\/\/(www\.)?(instagram\.com)\/(reel|p)\/[a-zA-Z0-9_-]+/i;

    let modifiedUrl = '';

    if (tiktokRegex.test(message.content)) {
      // Unfurl using vxtiktok proxy
      modifiedUrl = message.content.replace('tiktok.com', 'vxtiktok.com');
    } else if (twitterRegex.test(message.content)) {
      // Unfurl using fxtwitter/fixupx proxy
      modifiedUrl = message.content.replace('x.com', 'fxtwitter.com').replace('twitter.com', 'fxtwitter.com');
    } else if (instaRegex.test(message.content)) {
      // Unfurl using ddinstagram proxy
      modifiedUrl = message.content.replace('instagram.com', 'ddinstagram.com');
    }

    if (modifiedUrl) {
      await message.suppressEmbeds(true).catch(() => null);
      await message.reply({
        content: `[🎬 Direct Media Unfurl](${modifiedUrl})`,
        allowedMentions: { repliedUser: false },
      }).catch(() => null);
      return true;
    }

    return false;
  }
}
