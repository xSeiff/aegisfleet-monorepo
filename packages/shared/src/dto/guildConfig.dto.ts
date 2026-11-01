import { z } from 'zod';

export const GuildConfigUpdateSchema = z.object({
  guildId: z.string().regex(/^\d{17,20}$/, 'Invalid Discord Snowflake'),
  prefix: z.string().min(1).max(5).default('!'),
  language: z.string().min(2).max(10).default('en-US'),
  timezone: z.string().default('UTC'),
  logChannelId: z.string().regex(/^\d{17,20}$/).nullable().optional(),
  modLogChannelId: z.string().regex(/^\d{17,20}$/).nullable().optional(),
  welcomeChannelId: z.string().regex(/^\d{17,20}$/).nullable().optional(),
  leaveChannelId: z.string().regex(/^\d{17,20}$/).nullable().optional(),
});

export type GuildConfigUpdateInput = z.infer<typeof GuildConfigUpdateSchema>;
