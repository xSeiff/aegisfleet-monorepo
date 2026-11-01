import {
  Guild,
  ChannelType,
  GuildChannel,
} from 'discord.js';
import { prisma } from '@hugebot/database';

export interface SnapshotRoleData {
  id: string;
  name: string;
  color: number;
  hoist: boolean;
  position: number;
  permissions: string;
  mentionable: boolean;
}

export interface SnapshotChannelData {
  id: string;
  name: string;
  type: ChannelType;
  parentId: string | null;
  position: number;
  permissionOverwrites: Array<{
    id: string;
    type: number;
    allow: string;
    deny: string;
  }>;
}

export interface SnapshotPayload {
  guildId: string;
  name: string;
  afkTimeout: number;
  roles: SnapshotRoleData[];
  channels: SnapshotChannelData[];
  createdAt: number;
}

export class SnapshotManager {
  public async createSnapshot(guild: Guild, name: string): Promise<string> {
    const roles: SnapshotRoleData[] = guild.roles.cache
      .filter((r) => r.id !== guild.id && !r.managed)
      .map((r) => ({
        id: r.id,
        name: r.name,
        color: r.color,
        hoist: r.hoist,
        position: r.position,
        permissions: r.permissions.bitfield.toString(),
        mentionable: r.mentionable,
      }));

    const channels: SnapshotChannelData[] = guild.channels.cache
      .filter((c) => !c.isThread())
      .map((c) => {
        const rawPos = 'rawPosition' in c ? (c.rawPosition as number) : 0;
        const overwrites = 'permissionOverwrites' in c
          ? Array.from(c.permissionOverwrites.cache.values()).map((po: any) => ({
              id: po.id,
              type: po.type,
              allow: po.allow.bitfield.toString(),
              deny: po.deny.bitfield.toString(),
            }))
          : [];

        return {
          id: c.id,
          name: c.name,
          type: c.type,
          parentId: c.parentId,
          position: rawPos,
          permissionOverwrites: overwrites,
        };
      });

    const payload: SnapshotPayload = {
      guildId: guild.id,
      name: guild.name,
      afkTimeout: guild.afkTimeout,
      roles,
      channels,
      createdAt: Date.now(),
    };

    const record = await prisma.serverSnapshot.create({
      data: {
        guildId: guild.id,
        name,
        dataJson: payload as any,
      },
    });

    console.log(`[Snapshot] Created snapshot "${name}" (${record.id}) for guild ${guild.id}`);
    return record.id;
  }

  public async restoreSnapshot(guild: Guild, snapshotId: string): Promise<boolean> {
    const record = await prisma.serverSnapshot.findUnique({
      where: { id: snapshotId },
    });

    if (!record || record.guildId !== guild.id) {
      throw new Error('Snapshot record not found or does not belong to this server.');
    }

    const data = record.dataJson as unknown as SnapshotPayload;
    console.warn(`[Snapshot Restore] Starting disaster rollback for guild ${guild.id} from snapshot ${snapshotId}...`);

    // 1. Recreate missing roles
    const existingRoles = guild.roles.cache;
    for (const r of data.roles) {
      const match = existingRoles.find((role) => role.name === r.name);
      if (!match) {
        await guild.roles.create({
          name: r.name,
          color: r.color,
          hoist: r.hoist,
          permissions: BigInt(r.permissions),
          mentionable: r.mentionable,
          reason: 'Disaster Recovery: Restoring deleted role from snapshot',
        }).catch(() => null);
      }
    }

    // 2. Recreate missing channels
    const existingChannels = guild.channels.cache;
    for (const c of data.channels) {
      const exists = existingChannels.some((ch) => ch.name === c.name && ch.type === c.type);
      if (!exists && c.type !== ChannelType.GuildCategory) {
        await guild.channels.create({
          name: c.name,
          type: c.type as any,
          reason: 'Disaster Recovery: Restoring deleted channel from snapshot',
        }).catch(() => null);
      }
    }

    console.log(`[Snapshot Restore] Disaster recovery complete for guild ${guild.id}`);
    return true;
  }
}
