'use client';
import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { MainScene } from '../game/MainScene';

export default function GameCanvas({ onZoneEnter }: { onZoneEnter: (zone: string) => void }) {
    const gameRef = useRef<Phaser.Game | null>(null);

    useEffect(() => {
        if (typeof window !== 'undefined' && !gameRef.current) {
            const config: Phaser.Types.Core.GameConfig = {
                type: Phaser.AUTO,
                parent: 'game-container',
                width: window.innerWidth,
                height: window.innerHeight,
                physics: {
                    default: 'arcade',
                    arcade: { debug: false },
                },
                scene: [MainScene],
                transparent: true,
            };

            const game = new Phaser.Game(config);
            gameRef.current = game;

            game.events.on('ready', () => {
                const scene = game.scene.getScene('MainScene') as MainScene;
                scene.events.on('zone-enter', (zone: string) => {
                    onZoneEnter(zone);
                });
            });

            return () => {
                game.destroy(true);
            };
        }
    }, [onZoneEnter]);

    return <div id="game-container" className="w-full h-full" />;
}
