'use client';
import { useState, useEffect } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function Home() {
    const [activeDrawer, setActiveDrawer] = useState<string | null>(null);
    const [status, setStatus] = useState<any>(null);
    const [logs, setLogs] = useState<string[]>([]);

    useEffect(() => {
        const itv = setInterval(async () => {
            const res = await fetch(`${API_URL}/api/status`);
            setStatus(await res.json());

            if (activeDrawer === 'logs') {
                const lRes = await fetch(`${API_URL}/api/logs`);
                setLogs(await lRes.json());
            }
        }, 2000);
        return () => clearInterval(itv);
    }, [activeDrawer]);

    const handleZoneEnter = (id: string) => setActiveDrawer(id);

    return (
        <main className="relative w-screen h-screen overflow-hidden bg-slate-950 text-white">
            <div className="absolute top-4 left-4 z-10 flex gap-2">
                <div className={`px-3 py-1 rounded-full text-xs font-mono flex items-center gap-2 ${status?.online ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    <div className={`w-2 h-2 rounded-full ${status?.online ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                    {status?.online ? 'GATEWAY ONLINE' : 'GATEWAY OFFLINE'}
                </div>
            </div>

            <iframe src="/game" className="w-full h-full border-none" /> {/* Separated for better React stability */}

            {/* Drawer Overlay (simplified for brevitiy) */}
            {activeDrawer && (
                <div className="absolute top-0 right-0 w-1/3 h-full bg-slate-900 border-l border-white/10 p-6 z-20 shadow-2xl">
                    <header className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold uppercase tracking-widest">{activeDrawer}</h2>
                        <button onClick={() => setActiveDrawer(null)} className="opacity-50 hover:opacity-100">CLOSE</button>
                    </header>

                    {activeDrawer === 'logs' && (
                        <div className="bg-black p-4 font-mono text-xs h-[80vh] overflow-y-auto space-y-1">
                            {logs.map((l, i) => <div key={i} className="text-slate-300 border-b border-white/5 pb-1">{l}</div>)}
                        </div>
                    )}

                    {activeDrawer === 'settings' && (
                        <div className="space-y-4">
                            <button
                                onClick={() => fetch(`${API_URL}/api/system/restart-openclaw`, { method: 'POST' })}
                                className="w-full py-3 bg-red-600 hover:bg-red-700 rounded font-bold transition-colors"
                            >
                                RESTART OPENCLAW
                            </button>
                            <textarea
                                className="w-full h-64 bg-slate-800 p-4 font-mono text-sm rounded border border-white/10"
                                placeholder='{"patch": "safe..."}'
                            />
                        </div>
                    )}
                </div>
            )}
        </main>
    );
}
