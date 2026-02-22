import Fastify from 'fastify';
import { prisma } from './lib/prisma';
import { openClaw } from './lib/openclaw';

const fastify = Fastify({ logger: true });

// Auth Middleware Stub
fastify.addHook('preHandler', async (request, reply) => {
    // Simple check for MVP
    const auth = request.headers.authorization;
    if (!auth && request.url.startsWith('/api') && !request.url.includes('/auth')) {
        // throw new Error('Unauthorized'); // Enable later
    }
});

// Routes
fastify.get('/api/status', async () => {
    return openClaw.getStatus();
});

fastify.get('/api/agents', async () => {
    return prisma.agent.findMany();
});

fastify.post('/api/agents', async (request: any) => {
    return prisma.agent.create({ data: request.body });
});

fastify.get('/api/runs', async () => {
    return prisma.run.findMany({ orderBy: { createdAt: 'desc' } });
});

fastify.get('/api/logs', async () => {
    return openClaw.getLogs();
});

fastify.post('/api/settings/apply-patch', async (request: any) => {
    return openClaw.applyPatch(request.body);
});

fastify.post('/api/system/restart-openclaw', async () => {
    // Logic to execute 'docker restart openclaw'
    return { status: 'restarting' };
});

const start = async () => {
    try {
        openClaw.connect();
        await fastify.listen({ port: Number(process.env.PORT) || 3001, host: '0.0.0.0' });
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start();
