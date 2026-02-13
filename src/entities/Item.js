import { Container, Graphics, Sprite } from 'pixi.js';
import { CONFIG } from '../config/GameConfig.js';

export class Item extends Container {
    constructor() {
        super();

        this.radius = CONFIG.ITEM_RADIUS;
        this.isCollected = false;

        // Visuals
        const gfx = Sprite.from('item');
        gfx.anchor.set(0.5);
        gfx.width = this.radius * 2;
        gfx.height = this.radius * 2;
        this.addChild(gfx);

        // Animation
        this.bobOffset = Math.random() * 100;
    }

    update(delta) {
        // scale pulse
        /*
        const scale = 1 + Math.sin((Date.now() / 200) + this.bobOffset) * 0.1;
        this.scale.set(scale);
        */
    }
}
