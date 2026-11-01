import { z } from 'zod';
import { initTRPC, TRPCError } from '@trpc/server';
import { prisma } from '@hugebot/database';
import Redis from 'ioredis';

const t = initTRPC.create();
const redis = new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379');

const guildConfigInputSchema = z.object({
  guildId: z.string().regex(/^\d{17,20}$/, 'Invalid Discord Snowflake'),
  prefix: z.string().min(1).max(5).optional(),
  language: z.string().min(2).max(10).optional(),
  logChannelId: z.string().regex(/^\d{17,20}$/).nullable().optional(),
  modLogChannelId: z.string().regex(/^\d{17,20}$/).nullable().optional(),
  welcomeChannelId: z.string().regex(/^\d{17,20}$/).nullable().optional(),
});

export const guildRouter = t.router({
  getConfig: t.procedure
    .input(z.object({ guildId: z.string() }))
    .query(async ({ input }) => {
      const cached = await redis.get(`cache:guild:${input.guildId}`);
      if (cached) return JSON.parse(cached);

      const config = await prisma.guildConfig.findUnique({
        where: { guildId: input.guildId },
        include: {
          autoModRules: true,
          roleRewards: true,
          starboards: true,
        },
      });

      if (!config) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Guild configuration not found.' });
      }

      await redis.set(`cache:guild:${input.guildId}`, JSON.stringify(config), 'EX', 300);
      return config;
    }),

  updateConfig: t.procedure
    .input(guildConfigInputSchema)
    .mutation(async ({ input }) => {
      const { guildId, ...data } = input;

      const updated = await prisma.guildConfig.upsert({
        where: { guildId },
        create: { guildId, ...data },
        update: { ...data },
      });

      await redis.del(`cache:guild:${guildId}`);
      await redis.publish(
        'cluster:events:guild_update',
        JSON.stringify({ guildId, updatedFields: Object.keys(data) })
      );

      return { success: true, config: updated };
    }),

  getLiveMetrics: t.procedure.query(async () => {
    const rawMetrics = await redis.hgetall('telemetry:clusters');
    const clusters = Object.values(rawMetrics).map((str) => JSON.parse(str));

    const totalGuilds = clusters.reduce((acc, c: any) => acc + (c.guildCount || 0), 0);
    const totalRamMb = clusters.reduce((acc, c: any) => acc + (c.ramUsage || 0), 0);
    const avgPing = clusters.length > 0
      ? clusters.reduce((acc, c: any) => acc + (c.ping || 0), 0) / clusters.length
      : 0;

    return {
      clusters,
      summary: {
        totalClusters: clusters.length,
        totalGuilds,
        totalRamMb,
        avgPing: Math.round(avgPing),
      },
    };
  }),
});
