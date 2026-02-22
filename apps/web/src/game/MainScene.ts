import Phaser from 'phaser';

export class MainScene extends Phaser.Scene {
    private player!: Phaser.Physics.Arcade.Sprite;
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private stations: Phaser.GameObjects.Zone[] = [];

    constructor() {
        super('MainScene');
    }

    preload() {
        this.createAssets();
    }

    create() {
        // Background
        const grid = this.add.grid(400, 300, 1600, 1200, 32, 32, 0x1a1a1a).setOutlineStyle(0x333333);

        // Stations
        this.createStation(200, 200, 'Agents', 'agents');
        this.createStation(600, 200, 'Runs', 'runs');
        this.createStation(200, 500, 'Logs', 'logs');
        this.createStation(600, 500, 'Settings', 'settings');

        // Player (Circle instead of Sprite for simplicity)
        const graphics = this.add.graphics();
        graphics.fillStyle(0x00ff00, 1);
        graphics.fillCircle(16, 16, 16);
        graphics.generateTexture('player', 32, 32);
        graphics.destroy();

        this.player = this.physics.add.sprite(400, 300, 'player');
        this.player.setCollideWorldBounds(true);

        this.cursors = this.input.keyboard!.createCursorKeys();
        this.cameras.main.startFollow(this.player);
    }

    createStation(x: number, y: number, label: number | string, id: string) {
        const zone = this.add.zone(x, y, 64, 64).setRectangleDropZone(64, 64);
        this.physics.add.existing(zone, true);

        this.add.rectangle(x, y, 64, 64, 0x3333ff, 0.5);
        this.add.text(x, y - 50, label.toString(), { fontSize: '14px', color: '#fff' }).setOrigin(0.5);

        this.physics.add.overlap(this.player, zone, () => {
            this.events.emit('zone-enter', id);
        });
    }

    createAssets() {
        // Generate minimal textures via Graphics if no files
    }

    update() {
        const speed = 200;
        this.player.setVelocity(0);

        if (this.cursors.left.isDown) this.player.setVelocityX(-speed);
        else if (this.cursors.right.isDown) this.player.setVelocityX(speed);

        if (this.cursors.up.isDown) this.player.setVelocityY(-speed);
        else if (this.cursors.down.isDown) this.player.setVelocityY(speed);
    }
}
