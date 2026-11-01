import Fastify from 'fastify';
import cors from '@fastify/cors';
import { fastifyTRPCPlugin } from '@trpc/server/adapters/fastify';
import { guildRouter } from './trpc/routers/guildRouter';
import dotenv from 'dotenv';

dotenv.config();

const server = Fastify({
  logger: true,
});

async function main() {
  await server.register(cors, {
    origin: process.env.DASHBOARD_URL ?? 'http://localhost:3000',
    credentials: true,
  });

  await server.register(fastifyTRPCPlugin, {
    prefix: '/trpc',
    trpcOptions: { router: guildRouter },
  });

  server.get('/health', async () => ({ status: 'healthy', timestamp: Date.now() }));

  const port = Number(process.env.API_PORT ?? 4000);
  await server.listen({ port, host: '0.0.0.0' });
  console.log(`Fastify API & tRPC server listening at http://0.0.0.0:${port}`);
}

if (require.main === module) {
  main().catch((err) => {
    console.error('Server startup error:', err);
    process.exit(1);
  });
}
