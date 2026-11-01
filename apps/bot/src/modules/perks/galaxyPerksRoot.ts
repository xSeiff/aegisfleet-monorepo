import {
  SlashCommandBuilder,
  ApplicationIntegrationType,
  InteractionContextType,
  EmbedBuilder,
  GuildMember,
} from 'discord.js';
import { EnterpriseSlashCommand, SubcommandHandler, SubcommandGroupHandler } from '../../registry/commandTypes';
import { BoosterRoleManager } from './boosterRoles';
import { GalaxyOsintAndSniper } from './osintSniper';
import { GalaxyLastFmAndMedia } from './lastFmMedia';
import { GalaxyVoiceAndUtilities } from './voiceAndUtilities';
import Redis from 'ioredis';

const boosterManager = new BoosterRoleManager();
const lastFm = new GalaxyLastFmAndMedia();
const voiceUtils = new GalaxyVoiceAndUtilities();

let sniperInstance: GalaxyOsintAndSniper | null = null;
function getSniper(): GalaxyOsintAndSniper {
  if (!sniperInstance) {
    const redis = new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379', {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        return Math.min(times * 200, 2000);
      },
    });
    redis.on('error', () => {});
    sniperInstance = new GalaxyOsintAndSniper(redis);
  }
  return sniperInstance;
}

const builder = new SlashCommandBuilder()
  .setName('perks')
  .setDescription('Galaxy Bot Aesthetic, OSINT & Utility Suite')
  .addSubcommandGroup((group) =>
    group
      .setName('booster')
      .setDescription('Custom booster role perks')
      .addSubcommand((sub) =>
        sub
          .setName('create')
          .setDescription('Create or update your personal vanity booster role')
          .addStringOption((opt) => opt.setName('name').setDescription('Role name').setRequired(true))
          .addStringOption((opt) => opt.setName('hex_color').setDescription('Hex color code (e.g. #FF0055)').setRequired(false))
      )
      .addSubcommand((sub) =>
        sub
          .setName('share')
          .setDescription('Share your booster role with a friend')
          .addUserOption((opt) => opt.setName('friend').setDescription('Friend member').setRequired(true))
      )
  )
  .addSubcommandGroup((group) =>
    group
      .setName('snipe')
      .setDescription('Message history inspection')
      .addSubcommand((sub) =>
        sub
          .setName('message')
          .setDescription('View the last deleted message in this channel')
      )
  )
  .addSubcommandGroup((group) =>
    group
      .setName('lastfm')
      .setDescription('Last.fm scrobbler integration')
      .addSubcommand((sub) =>
        sub
          .setName('set')
          .setDescription('Link your Last.fm username')
          .addStringOption((opt) => opt.setName('username').setDescription('Last.fm username').setRequired(true))
      )
      .addSubcommand((sub) =>
        sub
          .setName('nowplaying')
          .setDescription('Display the track currently scrobbling')
      )
  )
  .addSubcommandGroup((group) =>
    group
      .setName('utility')
      .setDescription('Server engagement utilities')
      .addSubcommand((sub) =>
        sub
          .setName('afk')
          .setDescription('Set an AFK status notice')
          .addStringOption((opt) => opt.setName('reason').setDescription('Reason for stepping away').setRequired(false))
      )
  );

const boosterCreateHandler: SubcommandHandler = {
  name: 'create',
  description: 'Create vanity booster role',
  execute: async ({ interaction }) => {
    const member = interaction.member as GuildMember;
    const name = interaction.options.getString('name', true);
    const hex = interaction.options.getString('hex_color') ?? undefined;

    try {
      const role = await boosterManager.createOrUpdateBoosterRole(member, name, hex);
      await interaction.reply({
        content: `🎉 Custom booster role configured: <@&${role.id}> (${role.name})!`,
      });
    } catch (err) {
      await interaction.reply({ content: (err as Error).message, ephemeral: true });
    }
  },
};

const boosterShareHandler: SubcommandHandler = {
  name: 'share',
  description: 'Share booster role with a friend',
  execute: async ({ interaction }) => {
    const booster = interaction.member as GuildMember;
    const friend = interaction.options.getMember('friend') as GuildMember;

    if (!friend) {
      await interaction.reply({ content: 'Friend member not found.', ephemeral: true });
      return;
    }

    try {
      await boosterManager.shareBoosterRole(booster, friend);
      await interaction.reply({
        content: `🤝 Shared your booster role with <@${friend.id}>!`,
      });
    } catch (err) {
      await interaction.reply({ content: (err as Error).message, ephemeral: true });
    }
  },
};

const snipeMessageHandler: SubcommandHandler = {
  name: 'message',
  description: 'View the last deleted message',
  execute: async ({ interaction, channelId }) => {
    const sniper = getSniper();
    const sniped = await sniper.getSnipedMessage(channelId);
    if (!sniped) {
      await interaction.reply({ content: 'There is nothing to snipe in this channel!', ephemeral: true });
      return;
    }

    const embed = new EmbedBuilder()
      .setAuthor({ name: sniped.authorTag, iconURL: sniped.avatarUrl })
      .setDescription(sniped.content || '*(No text content)*')
      .setColor(0xe74c3c)
      .setFooter({ text: `Deleted ${Math.floor((Date.now() - sniped.timestamp) / 1000)}s ago` });

    if (sniped.attachmentUrl) {
      embed.setImage(sniped.attachmentUrl);
    }

    await interaction.reply({ embeds: [embed] });
  },
};

const lastFmSetHandler: SubcommandHandler = {
  name: 'set',
  description: 'Link Last.fm username',
  execute: async ({ interaction, invokerId }) => {
    const username = interaction.options.getString('username', true);
    await lastFm.setUsername(invokerId, username);
    await interaction.reply({ content: `✅ Linked Last.fm account: **${username}**`, ephemeral: true });
  },
};

const lastFmNpHandler: SubcommandHandler = {
  name: 'nowplaying',
  description: 'Display currently scrobbling track',
  execute: async ({ interaction, invokerId }) => {
    const track = await lastFm.getNowPlaying(invokerId);
    if (!track) {
      await interaction.reply({ content: 'No track scrobbling, or Last.fm account not set (use `/perks lastfm set`).', ephemeral: true });
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle(`🎵 ${track.artist} — ${track.name}`)
      .setDescription(`Album: **${track.album}**`)
      .setColor(0xd51007)
      .setFooter({ text: 'Last.fm Scrobbler' });

    await interaction.reply({ embeds: [embed] });
  },
};

const afkHandler: SubcommandHandler = {
  name: 'afk',
  description: 'Set AFK notice',
  execute: async ({ interaction, guildId, invokerId }) => {
    if (!guildId) return;
    const reason = interaction.options.getString('reason') ?? 'AFK';
    await voiceUtils.setAfk(guildId, invokerId, reason);
    await interaction.reply({ content: `💤 Set your AFK status: **${reason}**` });
  },
};

const boosterGroup: SubcommandGroupHandler = {
  name: 'booster',
  description: 'Custom booster role perks',
  subcommands: new Map([
    ['create', boosterCreateHandler],
    ['share', boosterShareHandler],
  ]),
};

const snipeGroup: SubcommandGroupHandler = {
  name: 'snipe',
  description: 'Message history inspection',
  subcommands: new Map([['message', snipeMessageHandler]]),
};

const lastFmGroup: SubcommandGroupHandler = {
  name: 'lastfm',
  description: 'Last.fm integration',
  subcommands: new Map([
    ['set', lastFmSetHandler],
    ['nowplaying', lastFmNpHandler],
  ]),
};

const utilityGroup: SubcommandGroupHandler = {
  name: 'utility',
  description: 'Server engagement utilities',
  subcommands: new Map([['afk', afkHandler]]),
};

export const galaxyPerksCommand: EnterpriseSlashCommand = {
  name: 'perks',
  description: 'Galaxy Bot Aesthetic, OSINT & Utility Suite',
  integrationTypes: [ApplicationIntegrationType.GuildInstall],
  contexts: [InteractionContextType.Guild],
  builder,
  groups: new Map([
    ['booster', boosterGroup],
    ['snipe', snipeGroup],
    ['lastfm', lastFmGroup],
    ['utility', utilityGroup],
  ]),
  rootSubcommands: new Map(),
};
