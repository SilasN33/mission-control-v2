import { WebSocket } from 'ws';

export class OpenClawClient {
    private ws: WebSocket | null = null;
    private url: string;
    private token: string;
    private logs: string[] = [];

    constructor(url: string, token: string) {
        this.url = url;
        this.token = token;
    }

    connect() {
        this.ws = new WebSocket(this.url);

        this.ws.on('open', () => {
            console.log('Connected to OpenClaw Gateway');
            if (this.token) {
                this.ws?.send(JSON.stringify({ type: 'auth', token: this.token }));
            }
        });

        this.ws.on('message', (data) => {
            const msg = JSON.parse(data.toString());
            if (msg.type === 'log') {
                this.logs.push(msg.payload);
                if (this.logs.length > 200) this.logs.shift();
            }
        });

        this.ws.on('close', () => setTimeout(() => this.connect(), 5000));
        this.ws.on('error', (err) => console.error('WS Error:', err.message));
    }

    async getStatus() {
        return {
            online: this.ws?.readyState === WebSocket.OPEN,
            url: this.url,
            timestamp: new Date().toISOString()
        };
    }

    getLogs() {
        return this.logs;
    }

    async applyPatch(patch: any) {
        // Whitelisted: Only sends to OpenClaw via internal command
        this.ws?.send(JSON.stringify({ type: 'config_patch', payload: patch }));
        return { success: true };
    }
}

export const openClaw = new OpenClawClient(
    process.env.OPENCLAW_GATEWAY_URL || 'ws://172.17.0.1:18789',
    process.env.OPENCLAW_AUTH_TOKEN || ''
);
