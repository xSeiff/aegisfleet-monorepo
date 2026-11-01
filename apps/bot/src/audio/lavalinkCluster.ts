import { LavaShark } from 'lavashark';
import { Client } from 'discord.js';

export function initializeAudioCluster(client: Client): LavaShark {
  const shark = new LavaShark({
    nodes: [
      {
        id: 'Lavalink-US-East-Primary',
        hostname: process.env.LAVALINK_NODE1_HOST ?? 'localhost',
        port: Number(process.env.LAVALINK_NODE1_PORT ?? 2333),
        password: process.env.LAVALINK_NODE1_PASSWORD ?? 'youshallnotpass',
        secure: false,
      },
      {
        id: 'Lavalink-EU-Central-Backup',
        hostname: process.env.LAVALINK_NODE2_HOST ?? 'localhost',
        port: Number(process.env.LAVALINK_NODE2_PORT ?? 2334),
        password: process.env.LAVALINK_NODE2_PASSWORD ?? 'youshallnotpass',
        secure: false,
      },
    ],
    sendWS: (guildId, payload) => {
      const guild = client.guilds.cache.get(guildId);
      if (guild) guild.shard.send(payload);
    },
  });

  shark.on('nodeConnect', (node) => {
    console.log(`[Audio Cluster] Connected to Node "${node.identifier}" successfully.`);
  });

  shark.on('nodeDisconnect', (node, code, reason) => {
    console.warn(`[Audio Cluster] Node "${node.identifier}" disconnected (Code: ${code}, Reason: ${reason}). Initiating failover...`);
  });

  return shark;
}
