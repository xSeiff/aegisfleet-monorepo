import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  SlashCommandSubcommandsOnlyBuilder,
  InteractionContextType,
  ApplicationIntegrationType,
  PermissionResolvable,
} from 'discord.js';

export interface CommandContext {
  interaction: ChatInputCommandInteraction;
  isUserInstall: boolean;
  isGuildInstall: boolean;
  invokerId: string;
  guildId: string | null;
  channelId: string;
}

export interface SubcommandHandler {
  name: string;
  description: string;
  cooldownSeconds?: number;
  requiredPermissions?: PermissionResolvable[];
  requirePremium?: boolean;
  execute: (ctx: CommandContext) => Promise<void>;
}

export interface SubcommandGroupHandler {
  name: string;
  description: string;
  subcommands: Map<string, SubcommandHandler>;
}

export interface EnterpriseSlashCommand {
  name: string;
  description: string;
  integrationTypes: ApplicationIntegrationType[];
  contexts: InteractionContextType[];
  builder: SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder;
  groups: Map<string, SubcommandGroupHandler>;
  rootSubcommands: Map<string, SubcommandHandler>;
  execute?: (ctx: CommandContext) => Promise<void>;
}
