import { Container, Graphics, Sprite } from 'pixi.js';
import { CONFIG } from '../config/GameConfig.js';
import { MathUtils } from '../utils/MathUtils.js';

export class Player extends Container {
    constructor() {
        super();

        // Visuals
        const gfx = Sprite.from('player');
        gfx.anchor.set(0.5);
        gfx.width = CONFIG.PLAYER_RADIUS * 2;
        gfx.height = CONFIG.PLAYER_RADIUS * 2;

        this.addChild(gfx);
        this.gfx = gfx;

        // Physics/Logic
        this.speed = CONFIG.PLAYER_SPEED;
        this.carryingItem = null;
        this.radius = CONFIG.PLAYER_RADIUS;
    }

    move(vx, vy, delta) {
        // Apply velocity
        this.x += vx * this.speed * delta;
        this.y += vy * this.speed * delta;

        // Clamp to screen bounds
        this.x = Math.max(this.radius, Math.min(CONFIG.DESIGN_WIDTH - this.radius, this.x));
        this.y = Math.max(this.radius, Math.min(CONFIG.DESIGN_HEIGHT - this.radius, this.y));
    }

    update(delta) {
        // Animation touches could go here
    }

    pickup(item) {
        if (this.carryingItem) return false;

        this.carryingItem = item;

        // Attach item to player visually
        // Pixel coordinates relative to player center
        item.position.set(0, -this.radius - 15);
        this.addChild(item);

        // Reduce speed while carrying
        this.speed = CONFIG.PLAYER_SPEED * 0.6;

        // Visual change: Tint player slightly to show effort? 
        this.gfx.tint = CONFIG.COLORS.PLAYER_CARRYING;

        return true;
    }

    deliver() {
        if (!this.carryingItem) return false;

        const item = this.carryingItem;
        this.carryingItem = null;

        // Detach item
        this.removeChild(item);

        // Restore speed
        this.speed = CONFIG.PLAYER_SPEED;

        // Restore visual
        this.gfx.tint = 0xffffff;

        return item;
    }
}
