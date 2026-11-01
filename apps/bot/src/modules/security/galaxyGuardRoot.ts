import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ApplicationIntegrationType,
  InteractionContextType,
  EmbedBuilder,
  TextChannel,
} from 'discord.js';
import { EnterpriseSlashCommand, SubcommandHandler, SubcommandGroupHandler } from '../../registry/commandTypes';
import { prisma } from '@hugebot/database';
import { SnapshotManager } from './snapshotManager';
import { AdvancedPurgeEngine } from './advancedPurge';

const snapshotManager = new SnapshotManager();
const purgeEngine = new AdvancedPurgeEngine();

const builder = new SlashCommandBuilder()
  .setName('guard')
  .setDescription('Galaxy Guard Anti-Nuke & Disaster Recovery Suite')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addSubcommandGroup((group) =>
    group
      .setName('antinuke')
      .setDescription('Anti-nuke and rogue staff controls')
      .addSubcommand((sub) =>
        sub
          .setName('config')
          .setDescription('Configure anti-nuke threshold limits')
          .addBooleanOption((opt) => opt.setName('enable').setDescription('Enable or disable anti-nuke').setRequired(true))
          .addRoleOption((opt) => opt.setName('quarantine_role').setDescription('Role given to rogue staff').setRequired(false))
      )
  )
  .addSubcommandGroup((group) =>
    group
      .setName('heat')
      .setDescription('Adaptive anti-spam heat engine')
      .addSubcommand((sub) =>
        sub
          .setName('status')
          .setDescription('Inspect current heat thresholds')
      )
  )
  .addSubcommandGroup((group) =>
    group
      .setName('snapshot')
      .setDescription('Server disaster recovery imaging')
      .addSubcommand((sub) =>
        sub
          .setName('create')
          .setDescription('Create a backup snapshot of roles, channels, and permissions')
          .addStringOption((opt) => opt.setName('name').setDescription('Snapshot identifier').setRequired(true))
      )
      .addSubcommand((sub) =>
        sub
          .setName('restore')
          .setDescription('1-click disaster rollback to a previous snapshot')
          .addStringOption((opt) => opt.setName('snapshot_id').setDescription('Target snapshot ID').setRequired(true))
      )
  )
  .addSubcommandGroup((group) =>
    group
      .setName('purge')
      .setDescription('Advanced multi-filter message purge')
      .addSubcommand((sub) =>
        sub
          .setName('filtered')
          .setDescription('Purge messages matching strict filters')
          .addIntegerOption((opt) => opt.setName('count').setDescription('Number of messages to check (up to 1000)').setRequired(true))
          .addBooleanOption((opt) => opt.setName('bots_only').setDescription('Purge only bot messages'))
          .addBooleanOption((opt) => opt.setName('humans_only').setDescription('Purge only human messages'))
          .addUserOption((opt) => opt.setName('user').setDescription('Purge only this user'))
          .addBooleanOption((opt) => opt.setName('attachments_only').setDescription('Purge only attachments'))
          .addBooleanOption((opt) => opt.setName('links_only').setDescription('Purge only links'))
          .addStringOption((opt) => opt.setName('regex').setDescription('Purge messages matching regex pattern'))
      )
  );

// Handlers
const antinukeConfigHandler: SubcommandHandler = {
  name: 'config',
  description: 'Configure anti-nuke threshold limits',
  requiredPermissions: [PermissionFlagsBits.Administrator],
  execute: async ({ interaction, guildId }) => {
    if (!guildId) return;
    await interaction.deferReply();

    const enable = interaction.options.getBoolean('enable', true);
    const quarantineRole = interaction.options.getRole('quarantine_role');

    await prisma.antiNukeConfig.upsert({
      where: { guildId },
      create: {
        guildId,
        enabled: enable,
        quarantineRoleId: quarantineRole?.id,
      },
      update: {
        enabled: enable,
        quarantineRoleId: quarantineRole ? quarantineRole.id : undefined,
      },
    });

    await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setTitle('🛡️ Galaxy Guard Anti-Nuke Interceptor Configured')
          .setColor(enable ? 0x2ecc71 : 0xe74c3c)
          .addFields(
            { name: 'Status', value: enable ? 'Active & Enforcing' : 'Disabled', inline: true },
            { name: 'Quarantine Role', value: quarantineRole ? `<@&${quarantineRole.id}>` : 'None', inline: true }
          ),
      ],
    });
  },
};

const heatStatusHandler: SubcommandHandler = {
  name: 'status',
  description: 'Inspect heat thresholds',
  execute: async ({ interaction, guildId }) => {
    if (!guildId) return;
    await interaction.deferReply();

    const config = await prisma.heatConfig.upsert({
      where: { guildId },
      create: { guildId },
      update: {},
    });

    await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setTitle('🔥 Galaxy Guard Adaptive Heat Engine Matrix')
          .setColor(0xe67e22)
          .addFields(
            { name: 'Warn Level', value: `${config.warnThreshold} pts`, inline: true },
            { name: 'Timeout Level', value: `${config.muteThreshold} pts`, inline: true },
            { name: 'Quarantine Level', value: `${config.quarantineThreshold} pts`, inline: true },
            { name: 'Panic Threshold', value: `${config.panicModeThreshold} pts`, inline: true }
          ),
      ],
    });
  },
};

const snapshotCreateHandler: SubcommandHandler = {
  name: 'create',
  description: 'Create a backup snapshot',
  requiredPermissions: [PermissionFlagsBits.Administrator],
  execute: async ({ interaction, guildId }) => {
    if (!guildId || !interaction.guild) return;
    const name = interaction.options.getString('name', true);
    await interaction.deferReply();

    const snapshotId = await snapshotManager.createSnapshot(interaction.guild, name);

    await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setTitle('📦 Server Disaster Snapshot Created')
          .setDescription(`Backup **${name}** safely recorded in cold storage.`)
          .addFields({ name: 'Snapshot ID', value: `\`${snapshotId}\`` })
          .setColor(0x3498db),
      ],
    });
  },
};

const snapshotRestoreHandler: SubcommandHandler = {
  name: 'restore',
  description: '1-click disaster rollback',
  requiredPermissions: [PermissionFlagsBits.Administrator],
  execute: async ({ interaction, guildId }) => {
    if (!guildId || !interaction.guild) return;
    const snapshotId = interaction.options.getString('snapshot_id', true);
    await interaction.deferReply();

    try {
      await snapshotManager.restoreSnapshot(interaction.guild, snapshotId);
      await interaction.editReply({
        content: `✅ Disaster rollback complete! Restored structure from snapshot \`${snapshotId}\`.`,
      });
    } catch (err) {
      await interaction.editReply({
        content: `❌ Rollback failed: ${(err as Error).message}`,
      });
    }
  },
};

const purgeFilteredHandler: SubcommandHandler = {
  name: 'filtered',
  description: 'Purge messages matching strict filters',
  requiredPermissions: [PermissionFlagsBits.ManageMessages],
  execute: async ({ interaction }) => {
    const channel = interaction.channel as TextChannel;
    if (!channel || !('bulkDelete' in channel)) {
      await interaction.reply({ content: 'Invalid channel context.', ephemeral: true });
      return;
    }

    const count = interaction.options.getInteger('count', true);
    const botsOnly = interaction.options.getBoolean('bots_only') ?? false;
    const humansOnly = interaction.options.getBoolean('humans_only') ?? false;
    const user = interaction.options.getUser('user');
    const attachmentsOnly = interaction.options.getBoolean('attachments_only') ?? false;
    const linksOnly = interaction.options.getBoolean('links_only') ?? false;
    const regex = interaction.options.getString('regex') ?? undefined;

    await interaction.deferReply({ ephemeral: true });

    const deletedCount = await purgeEngine.executePurge(channel, {
      count,
      botsOnly,
      humansOnly,
      targetUserId: user?.id,
      attachmentsOnly,
      linksOnly,
      regexPattern: regex,
    });

    await interaction.editReply({
      content: `🧹 Successfully deleted **${deletedCount}** message(s) matching your filter criteria.`,
    });
  },
};

const antinukeGroup: SubcommandGroupHandler = {
  name: 'antinuke',
  description: 'Anti-nuke controls',
  subcommands: new Map([['config', antinukeConfigHandler]]),
};

const heatGroup: SubcommandGroupHandler = {
  name: 'heat',
  description: 'Adaptive heat controls',
  subcommands: new Map([['status', heatStatusHandler]]),
};

const snapshotGroup: SubcommandGroupHandler = {
  name: 'snapshot',
  description: 'Disaster recovery snapshots',
  subcommands: new Map([
    ['create', snapshotCreateHandler],
    ['restore', snapshotRestoreHandler],
  ]),
};

const purgeGroup: SubcommandGroupHandler = {
  name: 'purge',
  description: 'Advanced purge',
  subcommands: new Map([['filtered', purgeFilteredHandler]]),
};

export const galaxyGuardCommand: EnterpriseSlashCommand = {
  name: 'guard',
  description: 'Galaxy Guard Anti-Nuke & Disaster Recovery Suite',
  integrationTypes: [ApplicationIntegrationType.GuildInstall],
  contexts: [InteractionContextType.Guild],
  builder,
  groups: new Map([
    ['antinuke', antinukeGroup],
    ['heat', heatGroup],
    ['snapshot', snapshotGroup],
    ['purge', purgeGroup],
  ]),
  rootSubcommands: new Map(),
};
