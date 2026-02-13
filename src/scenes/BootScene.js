import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import { CONFIG } from '../config/GameConfig.js';
import { AssetLoader } from '../core/AssetLoader.js';
import { MenuScene } from './MenuScene.js';

export class BootScene {
    constructor(game) {
        this.game = game;
        this.container = new Container();
    }

    async init() {
        // Create simple loading bar
        const barWidth = CONFIG.DESIGN_WIDTH * 0.6;
        const barHeight = 20;
        const barX = (CONFIG.DESIGN_WIDTH - barWidth) / 2;
        const barY = CONFIG.DESIGN_HEIGHT / 2;

        const bg = new Graphics()
            .rect(barX, barY, barWidth, barHeight)
            .fill(0x444444);
        this.container.addChild(bg);

        const fill = new Graphics()
            .rect(barX, barY, 0, barHeight)
            .fill(0xffffff);
        this.container.addChild(fill);

        // Load Assets
        try {
            await AssetLoader.loadAssets();

            // Show full bar
            fill.clear().rect(barX, barY, barWidth, barHeight).fill(0xffffff);

            // Short delay to see 100%
            setTimeout(() => {
                this.game.sceneManager.changeScene(new MenuScene(this.game));
            }, 500);

        } catch (e) {
            console.error('Failed to load assets:', e);
            // Fallback to menu anyway?
            this.game.sceneManager.changeScene(new MenuScene(this.game));
        }
    }

    update(delta) { }

    destroy() {
        this.container.destroy({ children: true });
    }
}
