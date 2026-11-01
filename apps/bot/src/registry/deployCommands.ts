import { REST, Routes, ApplicationIntegrationType, InteractionContextType } from 'discord.js';
import { CommandRegistry } from './commandRegistry';
import { securityCommand } from '../commands/moderation/securityRoot';
import { economyCommand } from '../commands/economy/economyRoot';
import { levelCommand } from '../commands/gamification/levelRoot';
import { ticketsCommand } from '../commands/tickets/ticketsRoot';
import { musicCommand } from '../commands/music/musicRoot';
import { automateCommand } from '../commands/automations/automateRoot';
import { socialCommand } from '../commands/social/socialRoot';
import { aiCommand } from '../commands/ai/aiRoot';

import { aboutCommand } from '../commands/about/aboutRoot';

// Galaxy Bot Signature Suites
import { galaxyGuardCommand } from '../modules/security/galaxyGuardRoot';
import { galaxySuiteCommand } from '../modules/galaxy/galaxySuiteRoot';
import { ticketSuiteCommand } from '../modules/tickets/ticketSuiteRoot';
import { galaxyPerksCommand } from '../modules/perks/galaxyPerksRoot';

import dotenv from 'dotenv';

dotenv.config();

export async function deployApplicationCommands() {
  const token = process.env.DISCORD_TOKEN;
  const clientId = process.env.DISCORD_CLIENT_ID;

  if (!token || !clientId) {
    console.log('[Deploy Commands] Skipping Discord REST deployment: DISCORD_TOKEN or DISCORD_CLIENT_ID not set in .env.');
    return;
  }

  const rest = new REST({ version: '10' }).setToken(token);
  const registry = CommandRegistry.getInstance();

  // Register all 13 domain & signature modules
  registry.registerCommand(securityCommand);
  registry.registerCommand(economyCommand);
  registry.registerCommand(levelCommand);
  registry.registerCommand(ticketsCommand);
  registry.registerCommand(musicCommand);
  registry.registerCommand(automateCommand);
  registry.registerCommand(socialCommand);
  registry.registerCommand(aiCommand);
  registry.registerCommand(aboutCommand);

  // Galaxy Guard, Galaxy Suite, Ticket Suite, Galaxy Perks
  registry.registerCommand(galaxyGuardCommand);
  registry.registerCommand(galaxySuiteCommand);
  registry.registerCommand(ticketSuiteCommand);
  registry.registerCommand(galaxyPerksCommand);

  const payload = registry.commands.map((cmd) => {
    const json = cmd.builder.toJSON();
    return {
      ...json,
      integration_types: [
        ApplicationIntegrationType.GuildInstall,
        ApplicationIntegrationType.UserInstall,
      ],
      contexts: [
        InteractionContextType.Guild,
        InteractionContextType.BotDM,
        InteractionContextType.PrivateChannel,
      ],
    };
  });

  console.log(`[Deploy Commands] Publishing ${payload.length} global root command trees to Discord REST...`);
  await rest.put(Routes.applicationCommands(clientId), { body: payload });
  console.log('[Deploy Commands] Successfully published all command trees with 2026 dual-context specifications.');
}

if (require.main === module) {
  deployApplicationCommands().catch(console.error);
}
