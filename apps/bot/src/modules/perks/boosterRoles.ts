import {
  GuildMember,
  ColorResolvable,
  Role,
} from 'discord.js';
import { prisma } from '@hugebot/database';

export class BoosterRoleManager {
  public async createOrUpdateBoosterRole(member: GuildMember, name: string, hexColor?: string, iconUrl?: string): Promise<Role> {
    if (!member.premiumSince) {
      throw new Error('You must be boosting the server to configure a custom booster role.');
    }

    const guild = member.guild;
    let existingRecord = await prisma.boosterRole.findUnique({
      where: { guildId_userId: { guildId: guild.id, userId: member.id } },
    });

    let role: Role | null = null;
    if (existingRecord) {
      role = guild.roles.cache.get(existingRecord.roleId) || null;
    }

    if (!role) {
      // Create fresh role right below bot's highest role
      role = await guild.roles.create({
        name,
        color: (hexColor as ColorResolvable) || undefined,
        position: guild.members.me?.roles.highest.position ? guild.members.me.roles.highest.position - 1 : 1,
        reason: `Custom Booster Role for ${member.user.tag}`,
      });

      await member.roles.add(role, 'Assigned own booster role');
    } else {
      await role.edit({
        name,
        color: (hexColor as ColorResolvable) || undefined,
      });
    }

    await prisma.boosterRole.upsert({
      where: { guildId_userId: { guildId: guild.id, userId: member.id } },
      create: {
        guildId: guild.id,
        userId: member.id,
        roleId: role.id,
        colorHex: hexColor,
        iconUrl,
        sharedUserIds: [],
      },
      update: {
        colorHex: hexColor,
        iconUrl,
      },
    });

    return role;
  }

  public async shareBoosterRole(booster: GuildMember, friendMember: GuildMember): Promise<void> {
    const record = await prisma.boosterRole.findUnique({
      where: { guildId_userId: { guildId: booster.guild.id, userId: booster.id } },
    });

    if (!record) {
      throw new Error('You do not have a custom booster role created yet.');
    }

    const role = booster.guild.roles.cache.get(record.roleId);
    if (!role) {
      throw new Error('Booster role not found on Discord.');
    }

    await friendMember.roles.add(role, `Shared by booster ${booster.user.tag}`);

    await prisma.boosterRole.update({
      where: { id: record.id },
      data: {
        sharedUserIds: { push: friendMember.id },
      },
    });
  }

  public async handleBoosterRemoved(member: GuildMember): Promise<void> {
    const record = await prisma.boosterRole.findUnique({
      where: { guildId_userId: { guildId: member.guild.id, userId: member.id } },
    });

    if (!record) return;

    const role = member.guild.roles.cache.get(record.roleId);
    if (role) {
      console.log(`[Booster Roles] Removing expired booster role ${role.name} (${role.id}) in guild ${member.guild.id}`);
      await role.delete('Server boost expired').catch(() => null);
    }

    await prisma.boosterRole.delete({
      where: { id: record.id },
    }).catch(() => null);
  }
}
