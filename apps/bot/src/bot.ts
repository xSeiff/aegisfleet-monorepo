import { Client, GatewayIntentBits, Partials, Events } from 'discord.js';
import { ClusterClient, getInfo } from 'discord-hybrid-sharding';
import Redis from 'ioredis';
import { CommandRegistry } from './registry/commandRegistry';

// Base Commands
import { securityCommand } from './commands/moderation/securityRoot';
import { economyCommand } from './commands/economy/economyRoot';
import { levelCommand } from './commands/gamification/levelRoot';
import { ticketsCommand } from './commands/tickets/ticketsRoot';
import { musicCommand } from './commands/music/musicRoot';
import { automateCommand } from './commands/automations/automateRoot';
import { socialCommand } from './commands/social/socialRoot';
import { aiCommand } from './commands/ai/aiRoot';

// Signature Galaxy Bot Suites
import { galaxyGuardCommand } from './modules/security/galaxyGuardRoot';
import { galaxySuiteCommand } from './modules/galaxy/galaxySuiteRoot';
import { ticketSuiteCommand } from './modules/tickets/ticketSuiteRoot';
import { galaxyPerksCommand } from './modules/perks/galaxyPerksRoot';
import { aboutCommand } from './commands/about/aboutRoot';

// Engine Instances
import { AntiNukeInterceptor } from './modules/security/antiNukeInterceptor';
import { AdaptiveHeatEngine } from './modules/security/heatEngine';
import { JoinGateSecurity } from './modules/security/joinGate';
import { GalaxyLevelingEngine } from './modules/galaxy/levelingEngine';
import { GalaxyAutoResponder } from './modules/galaxy/autoResponder';
import { GalaxyReactionRoles } from './modules/galaxy/reactionRoles';
import { GalaxyLoggingGrid } from './modules/galaxy/loggingGrid';
import { TicketIntakeModals } from './modules/tickets/intakeModals';
import { TicketFeedbackCollector } from './modules/tickets/feedbackCollector';
import { GalaxyOsintAndSniper } from './modules/perks/osintSniper';
import { GalaxyLastFmAndMedia } from './modules/perks/lastFmMedia';
import { GalaxyVoiceAndUtilities } from './modules/perks/voiceAndUtilities';
import { prisma } from '@hugebot/database';
import dotenv from 'dotenv';

dotenv.config();

declare module 'discord.js' {
  interface Client {
    cluster: ClusterClient;
  }
}

const client = new Client({
  shards: getInfo().SHARD_LIST,
  shardCount: getInfo().TOTAL_SHARDS,
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessageReactions,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

client.cluster = new ClusterClient(client);

const redis = new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379', {
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    return Math.min(times * 200, 2000);
  },
});
redis.on('error', () => {});
const registry = CommandRegistry.getInstance(redis);

// Initialize Engines
const antiNuke = new AntiNukeInterceptor(redis);
const heatEngine = new AdaptiveHeatEngine(redis);
const joinGate = new JoinGateSecurity();
const leveling = new GalaxyLevelingEngine(redis);
const autoResponder = new GalaxyAutoResponder();
const reactionRoles = new GalaxyReactionRoles();
const loggingGrid = new GalaxyLoggingGrid();
const ticketModals = new TicketIntakeModals();
const ticketFeedback = new TicketFeedbackCollector();
const sniper = new GalaxyOsintAndSniper(redis);
const lastFmMedia = new GalaxyLastFmAndMedia();
const voiceUtils = new GalaxyVoiceAndUtilities();

// Register Core & Extended Commands
registry.registerCommand(securityCommand);
registry.registerCommand(economyCommand);
registry.registerCommand(levelCommand);
registry.registerCommand(ticketsCommand);
registry.registerCommand(musicCommand);
registry.registerCommand(automateCommand);
registry.registerCommand(socialCommand);
registry.registerCommand(aiCommand);
registry.registerCommand(aboutCommand);

// Register Galaxy Bot Signature Suites
registry.registerCommand(galaxyGuardCommand);
registry.registerCommand(galaxySuiteCommand);
registry.registerCommand(ticketSuiteCommand);
registry.registerCommand(galaxyPerksCommand);

client.on(Events.ClientReady, async () => {
  console.log(`[Cluster ${client.cluster.id}] Online as ${client.user?.tag}! (All 12 Modules Active)`);

  const syncGuilds = async () => {
    try {
      const guildList = client.guilds.cache.map((g) => ({
        id: g.id,
        name: g.name,
        icon: g.iconURL(),
        memberCount: g.memberCount,
        ownerId: g.ownerId,
      }));
      await redis.set('bot:guilds', JSON.stringify(guildList));

      for (const g of client.guilds.cache.values()) {
        await prisma.guildConfig.upsert({
          where: { guildId: g.id },
          create: { guildId: g.id },
          update: {},
        });
      }
    } catch (e) {
      console.error('Error syncing bot guilds:', e);
    }
  };

  await syncGuilds();
  setInterval(syncGuilds, 15000);

  setInterval(() => {
    const memory = process.memoryUsage();
    client.cluster.send({
      _type: 'DISCORD_METRICS_BEAT',
      ramUsage: Math.round(memory.heapUsed / 1024 / 1024),
      guildCount: client.guilds.cache.size,
      ping: client.ws.ping,
    });
  }, 10000);
});

client.on('error', (err) => {
  console.error('[Discord Client Error]:', err.message);
});

process.on('unhandledRejection', (reason) => {
  console.error('[Process Unhandled Rejection]:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('[Process Uncaught Exception]:', err);
});

// Interactions Handler
client.on('interactionCreate', async (interaction) => {
  if (interaction.isChatInputCommand()) {
    await registry.handleInteraction(interaction);
  } else if (interaction.isButton()) {
    if (interaction.customId.startsWith('joingate_verify:')) {
      await joinGate.handleVerificationButton(interaction);
    } else if (interaction.customId.startsWith('rr:')) {
      await reactionRoles.handleButtonInteraction(interaction);
    } else if (interaction.customId.startsWith('ticket_open:')) {
      const panelId = interaction.customId.split(':')[1];
      const modal = ticketModals.createModal(panelId, 'Open Support Ticket');
      await interaction.showModal(modal);
    } else if (interaction.customId.startsWith('csat:')) {
      await ticketFeedback.handleRatingButton(interaction);
    }
  } else if (interaction.isModalSubmit()) {
    if (interaction.customId.startsWith('ticket_modal:')) {
      await ticketModals.handleModalSubmit(interaction);
    }
  }
});

// Messages Handler
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  // 1. Galaxy Guard Honeypot & Heat Engine
  await joinGate.handleHoneypotTrigger(message);
  await heatEngine.evaluateMessage(message);

  // 2. Galaxy Leveling & Auto-Responder
  await leveling.processTextMessage(message);
  await autoResponder.handleMessage(message);

  // 3. Galaxy Sticky Messages & AFK check & Media Unfurl
  await voiceUtils.handleStickyMessage(message);
  await voiceUtils.checkMentionsForAfk(message);
  await lastFmMedia.handleMediaUnfurl(message);
});

// Message Deletions & Edits Logging + Sniper
client.on('messageDelete', async (message) => {
  if (message.partial) return;
  await sniper.cacheDeletedMessage(message as any);
  await loggingGrid.logMessageDelete(message as any);
});

client.on('messageUpdate', async (oldMsg, newMsg) => {
  if (oldMsg.partial || newMsg.partial) return;
  await sniper.cacheEditedMessage(oldMsg as any, newMsg as any);
  await loggingGrid.logMessageEdit(oldMsg as any, newMsg as any);
});

// Voice State Updates
client.on('voiceStateUpdate', async (oldState, newState) => {
  await loggingGrid.logVoiceStateUpdate(oldState, newState);
  await voiceUtils.handleVoiceState(oldState, newState);
});

// Member Joins (JoinGate)
client.on('guildMemberAdd', async (member) => {
  const allowed = await joinGate.handleMemberJoin(member);
  if (!allowed) {
    await joinGate.sendVerificationPrompt(member);
  }
});

// Audit Log Interceptor (Anti-Nuke)
client.on(Events.GuildAuditLogEntryCreate, async (entry, guild) => {
  await antiNuke.inspectAuditAction(guild, entry);
});

// Role Tamper Guard (@everyone guard)
client.on('roleUpdate', async (oldRole, newRole) => {
  await antiNuke.handleEveryoneRoleGuard(oldRole, newRole);
});

if (process.env.DISCORD_TOKEN) {
  client.login(process.env.DISCORD_TOKEN);
} else {
  console.log('[Bot Worker] Waiting for DISCORD_TOKEN configuration...');
}
