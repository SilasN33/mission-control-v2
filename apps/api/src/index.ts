import Fastify from 'fastify';
import { randomUUID } from 'crypto';
import db from './lib/db';
import { openClaw } from './lib/openclaw';

const fastify = Fastify({ logger: true });

// CORS for frontend
fastify.addHook('onSend', async (request, reply) => {
    reply.header('Access-Control-Allow-Origin', '*');
    reply.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    reply.header('Access-Control-Allow-Headers', 'Content-Type');
});
fastify.addHook('preHandler', async (request, reply) => {
    if (request.method === 'OPTIONS') { reply.send(); }
});

// Status
fastify.get('/api/status', async () => openClaw.getStatus());

// Agents
fastify.get('/api/agents', async () => db.prepare('SELECT * FROM agents ORDER BY createdAt DESC').all());

fastify.post('/api/agents', async (request: any) => {
    const { name, description, systemPrompt, model, maxTokens, historyLimit, ttlMinutes, toolsAllowed } = request.body;
    const id = randomUUID();
    db.prepare('INSERT INTO agents (id,name,description,systemPrompt,model,maxTokens,historyLimit,ttlMinutes,toolsAllowed) VALUES (?,?,?,?,?,?,?,?,?)')
        .run(id, name, description || '', systemPrompt, model, maxTokens || 2000, historyLimit || 10, ttlMinutes || 60, toolsAllowed || '');
    return db.prepare('SELECT * FROM agents WHERE id = ?').get(id);
});

fastify.put('/api/agents/:id', async (request: any) => {
    const { name, description, systemPrompt, model, maxTokens, historyLimit, ttlMinutes, toolsAllowed } = request.body;
    db.prepare('UPDATE agents SET name=?,description=?,systemPrompt=?,model=?,maxTokens=?,historyLimit=?,ttlMinutes=?,toolsAllowed=? WHERE id=?')
        .run(name, description, systemPrompt, model, maxTokens, historyLimit, ttlMinutes, toolsAllowed, request.params.id);
    return db.prepare('SELECT * FROM agents WHERE id = ?').get(request.params.id);
});

fastify.delete('/api/agents/:id', async (request: any) => {
    db.prepare('DELETE FROM agents WHERE id = ?').run(request.params.id);
    return { success: true };
});

// Runs
fastify.get('/api/runs', async () => db.prepare('SELECT * FROM runs ORDER BY createdAt DESC LIMIT 100').all());

fastify.post('/api/runs', async (request: any) => {
    const { agentId, input } = request.body;
    const id = randomUUID();
    db.prepare('INSERT INTO runs (id,agentId,status,input) VALUES (?,?,?,?)').run(id, agentId, 'pending', input || '');
    return db.prepare('SELECT * FROM runs WHERE id = ?').get(id);
});

// Logs
fastify.get('/api/logs', async () => openClaw.getLogs());

// Settings patch
fastify.post('/api/settings/apply-patch', async (request: any) => openClaw.applyPatch(request.body));

// Restart
fastify.post('/api/system/restart-openclaw', async () => ({ status: 'restarting' }));

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
