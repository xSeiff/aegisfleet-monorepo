import {
  SlashCommandBuilder,
  ApplicationIntegrationType,
  InteractionContextType,
  EmbedBuilder,
} from 'discord.js';
import { EnterpriseSlashCommand } from '../../registry/commandTypes';

const builder = new SlashCommandBuilder()
  .setName('about')
  .setDescription('Display information, system architecture, and credits for Galaxy Bot');

export const aboutCommand: EnterpriseSlashCommand = {
  name: 'about',
  description: 'Display information, system architecture, and credits for Galaxy Bot',
  integrationTypes: [ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall],
  contexts: [InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel],
  builder,
  groups: new Map(),
  rootSubcommands: new Map(),
  execute: async ({ interaction }) => {
    const memory = process.memoryUsage();
    const ramMb = Math.round(memory.heapUsed / 1024 / 1024);
    const uptimeSeconds = Math.floor(process.uptime());
    const uptimeFormatted = `${Math.floor(uptimeSeconds / 3600)}h ${Math.floor((uptimeSeconds % 3600) / 60)}m ${uptimeSeconds % 60}s`;

    const embed = new EmbedBuilder()
      .setTitle('🌌 Galaxy Bot — Enterprise Distributed Ecosystem')
      .setDescription(
        '**Galaxy Bot** is a modern, high-throughput, enterprise-scale Discord bot ecosystem engineered for ultra-resilient community management, multi-filter security, dynamic audio/visual media, and high-frequency engagement.'
      )
      .setColor(0x6366f1)
      .addFields(
        {
          name: '👨‍💻 Creator & Credits',
          value: '**xSeif**\n[GitHub Profile](https://github.com/xSeiff)',
          inline: true,
        },
        {
          name: '🚀 Architecture',
          value: '• Hybrid Sharding (`discord-hybrid-sharding`)\n• Next.js 15 App Router Dashboard\n• Fastify + tRPC Microservice API\n• Prisma ORM + Redis Multi-Cache',
          inline: true,
        },
        {
          name: '🛡️ Tenancy & Isolation',
          value: '100% Public Multi-Tenant Isolated (`guildId` partitioned state, logs, and rules)',
          inline: false,
        },
        {
          name: '📊 Performance Metrics',
          value: `• Memory: **${ramMb} MB**\n• Uptime: **${uptimeFormatted}**\n• WebSocket Latency: **${interaction.client.ws.ping}ms**\n• Cluster: **#${interaction.client.cluster?.id ?? 0}**`,
          inline: true,
        },
        {
          name: '✨ Signature Capabilities',
          value: '• `/guard` — Anti-Nuke Interceptor & Panic Recovery\n• `/galaxy` — Dynamic Rank Cards & Casino\n• `/ticketsuite` — Support Panels & HTML Transcripts\n• `/perks` — Booster Vanity Roles & Voice Rooms',
          inline: true,
        }
      )
      .setFooter({
        text: 'Galaxy Bot • Created by xSeif (https://github.com/xSeiff)',
        iconURL: interaction.client.user?.displayAvatarURL(),
      })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
