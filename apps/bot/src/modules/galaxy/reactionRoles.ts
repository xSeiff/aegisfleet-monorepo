import {
  ButtonInteraction,
  GuildMember,
} from 'discord.js';
import { prisma, ReactionRoleMode } from '@hugebot/database';

export interface ReactionRoleBinding {
  roleId: string;
  emojiOrId: string;
}

export class GalaxyReactionRoles {
  public async handleButtonInteraction(interaction: ButtonInteraction): Promise<void> {
    if (!interaction.customId.startsWith('rr:')) return;

    const [, panelId, targetRoleId] = interaction.customId.split(':');
    const member = interaction.member as GuildMember;
    if (!member) return;

    const panel = await prisma.reactionRolePanel.findUnique({
      where: { id: panelId },
    });

    if (!panel) {
      await interaction.reply({ content: 'Reaction role panel no longer exists.', ephemeral: true });
      return;
    }

    const hasRole = member.roles.cache.has(targetRoleId);

    if (panel.mode === ReactionRoleMode.UNIQUE) {
      // Remove all other roles in panel
      const bindings = (panel.bindingsJson as unknown as ReactionRoleBinding[]) || [];
      for (const b of bindings) {
        if (b.roleId !== targetRoleId && member.roles.cache.has(b.roleId)) {
          await member.roles.remove(b.roleId).catch(() => null);
        }
      }
      await member.roles.add(targetRoleId).catch(() => null);
      await interaction.reply({ content: `✅ Assigned exclusive role: <@&${targetRoleId}>.`, ephemeral: true });
    } else {
      // Toggle role
      if (hasRole) {
        await member.roles.remove(targetRoleId).catch(() => null);
        await interaction.reply({ content: `❌ Removed role: <@&${targetRoleId}>.`, ephemeral: true });
      } else {
        await member.roles.add(targetRoleId).catch(() => null);
        await interaction.reply({ content: `✅ Assigned role: <@&${targetRoleId}>.`, ephemeral: true });
      }
    }
  }
}
