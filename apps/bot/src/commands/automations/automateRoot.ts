import {
  SlashCommandBuilder,
  ApplicationIntegrationType,
  InteractionContextType,
  EmbedBuilder,
  PermissionFlagsBits,
} from 'discord.js';
import { EnterpriseSlashCommand, SubcommandHandler, SubcommandGroupHandler } from '../../registry/commandTypes';
import { prisma } from '@hugebot/database';

const builder = new SlashCommandBuilder()
  .setName('automate')
  .setDescription('Server Utilities, Custom Automations & Triggers Suite')
  .addSubcommandGroup((group) =>
    group
      .setName('customcmd')
      .setDescription('Custom script management')
      .addSubcommand((sub) =>
        sub
          .setName('create')
          .setDescription('Create a dynamic custom response script')
          .addStringOption((opt) => opt.setName('trigger').setDescription('Command trigger name').setRequired(true))
          .addStringOption((opt) => opt.setName('response').setDescription('Response text or script payload').setRequired(true))
      )
  )
  .addSubcommandGroup((group) =>
    group
      .setName('utility')
      .setDescription('Server diagnostics and information')
      .addSubcommand((sub) =>
        sub
          .setName('server_info')
          .setDescription('Display server telemetry and specifications')
      )
  );

const customCmdCreateHandler: SubcommandHandler = {
  name: 'create',
  description: 'Create a dynamic custom response script',
  requiredPermissions: [PermissionFlagsBits.ManageGuild],
  cooldownSeconds: 3,
  execute: async ({ interaction, guildId }) => {
    if (!guildId) {
      await interaction.reply({ content: 'Custom commands can only be configured in a server.', ephemeral: true });
      return;
    }

    const trigger = interaction.options.getString('trigger', true).toLowerCase();
    const response = interaction.options.getString('response', true);

    await prisma.customCommand.upsert({
      where: { guildId_triggerName: { guildId, triggerName: trigger } },
      create: {
        guildId,
        triggerName: trigger,
        astScriptJson: { type: 'LITERAL_TEXT', value: response },
      },
      update: {
        astScriptJson: { type: 'LITERAL_TEXT', value: response },
      },
    });

    await interaction.reply({
      content: `✅ Custom trigger \`${trigger}\` successfully configured.`,
    });
  },
};

const serverInfoHandler: SubcommandHandler = {
  name: 'server_info',
  description: 'Display server specifications',
  cooldownSeconds: 2,
  execute: async ({ interaction, guildId }) => {
    if (!guildId || !interaction.guild) {
      await interaction.reply({ content: 'Server info only available in servers.', ephemeral: true });
      return;
    }

    const guild = interaction.guild;
    const embed = new EmbedBuilder()
      .setTitle(`Server Specs: ${guild.name}`)
      .setColor(0x9b59b6)
      .setThumbnail(guild.iconURL() ?? null)
      .addFields(
        { name: 'Guild ID', value: guild.id, inline: true },
        { name: 'Owner', value: `<@${guild.ownerId}>`, inline: true },
        { name: 'Member Count', value: guild.memberCount.toLocaleString(), inline: true },
        { name: 'Created At', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`, inline: true },
        { name: 'Verification Tier', value: `${guild.verificationLevel}`, inline: true },
        { name: 'Boost Level', value: `Tier ${guild.premiumTier} (${guild.premiumSubscriptionCount ?? 0} boosts)`, inline: true }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};

const customCmdGroup: SubcommandGroupHandler = {
  name: 'customcmd',
  description: 'Custom script management',
  subcommands: new Map([['create', customCmdCreateHandler]]),
};

const utilityGroup: SubcommandGroupHandler = {
  name: 'utility',
  description: 'Server diagnostics',
  subcommands: new Map([['server_info', serverInfoHandler]]),
};

export const automateCommand: EnterpriseSlashCommand = {
  name: 'automate',
  description: 'Server Utilities, Custom Automations & Triggers Suite',
  integrationTypes: [ApplicationIntegrationType.GuildInstall],
  contexts: [InteractionContextType.Guild],
  builder,
  groups: new Map([
    ['customcmd', customCmdGroup],
    ['utility', utilityGroup],
  ]),
  rootSubcommands: new Map(),
};
