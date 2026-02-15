import { Container, Graphics } from 'pixi.js';
import { CONFIG } from '../config/GameConfig.js';

export class TimerBar extends Container {
    constructor(maxTime) {
        super();

        this.barWidth = CONFIG.DESIGN_WIDTH * 0.8;
        this.barHeight = 20;
        this.maxTime = maxTime || CONFIG.TIME_LIMIT;

        this.init();
    }

    init() {
        // Container positioning handled by parent

        // Background
        const bg = new Graphics()
            .rect(0, 0, this.barWidth, this.barHeight)
            .fill({ color: 0x333333, alpha: 0.5 })
            .stroke({ width: 4, color: 0x000000 });
        this.addChild(bg);

        // Fill
        this.fill = new Graphics()
            .rect(0, 0, this.barWidth, this.barHeight)
            .fill(0xffffff);
        this.addChild(this.fill);

        // Set pivot to center for easier positioning if needed, or keeping top-left is fine.
        // Let's keep top-left origin for the bar drawing, but center the container in scene
    }

    update(timeLeft) {
        const ratio = Math.max(0, Math.min(1, timeLeft / this.maxTime));

        // Update width scale
        this.fill.scale.x = ratio;

        // Color
        if (ratio <= 0.3) {
            this.fill.tint = 0xe74c3c; // Red
        } else if (ratio <= 0.6) {
            this.fill.tint = 0xf1c40f; // Yellow
        } else {
            this.fill.tint = 0x2ecc71; // Green
        }
    }
}
