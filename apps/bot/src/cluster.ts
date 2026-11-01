import { ClusterManager, HeartbeatManager, ReClusterManager } from 'discord-hybrid-sharding';
import path from 'path';
import dotenv from 'dotenv';
import Redis from 'ioredis';

dotenv.config();

const redis = new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379', {
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    return Math.min(times * 200, 2000);
  },
});
redis.on('error', () => {});

const manager = new ClusterManager(path.join(__dirname, 'bot.js'), {
  totalShards: 'auto',
  shardsPerClusters: 4,
  totalClusters: 'auto',
  mode: 'process',
  token: process.env.DISCORD_TOKEN,
  respawn: true,
  restarts: {
    max: 10,
    interval: 60000 * 60, // 1 hour window
  },
});

manager.extend(
  new HeartbeatManager({
    interval: 10000,
    maxMissedHeartbeats: 3,
  })
);

manager.extend(
  new ReClusterManager({
    restartMode: 'gracefulSwitch',
  })
);

manager.on('clusterCreate', (cluster) => {
  console.log(`[Cluster Orchestrator] Launched Cluster ${cluster.id} (Handling Shards: ${cluster.shardList.join(', ')})`);

  cluster.on('message', async (message: any) => {
    if (message?._type === 'DISCORD_METRICS_BEAT') {
      try {
        if (redis.status === 'ready') {
          await redis.hset(
            'telemetry:clusters',
            `cluster:${cluster.id}`,
            JSON.stringify({
              clusterId: cluster.id,
              shards: cluster.shardList,
              ramUsage: message.ramUsage,
              guildCount: message.guildCount,
              ping: message.ping,
              lastSeen: Date.now(),
            })
          );
        }
      } catch {}
    }
  });

  cluster.on('death', (_proc, expected) => {
    console.error(`[Cluster Orchestrator] Cluster ${cluster.id} died! Expected: ${expected}. Initiating recovery...`);
  });
});

async function bootstrap() {
  if (!process.env.DISCORD_TOKEN) {
    console.warn('[Cluster Orchestrator] No DISCORD_TOKEN provided. Please populate .env.');
    return;
  }
  console.log('[Cluster Orchestrator] Initializing Hybrid Sharding Topology...');
  await manager.spawn({ timeout: -1, delay: 7500 });
}

bootstrap().catch((err) => {
  console.error('[Cluster Orchestrator] Fatal error during cluster spawn:', err);
  process.exit(1);
});
