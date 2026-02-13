import { Container, Graphics } from 'pixi.js';
import { CONFIG } from '../config/GameConfig.js';

export class BonusItem extends Container {
    constructor() {
        super();

        this.radius = 15;
        this.lifeTime = 0;

        // Visuals: A stylized clock or plus sign
        const gfx = new Graphics();

        // Circle background
        gfx.circle(0, 0, this.radius).fill(0x3498db); // Blue

        // Plus sign
        gfx.rect(-8, -2, 16, 4).fill(0xffffff);
        gfx.rect(-2, -8, 4, 16).fill(0xffffff);

        this.addChild(gfx);

        // Slight pulse animation
        this.scale.set(1);
    }

    update(delta) {
        this.lifeTime += delta * 0.05;
        this.scale.set(1 + Math.sin(this.lifeTime) * 0.1);
    }
}
