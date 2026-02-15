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
        this.maxSpeed = CONFIG.PLAYER_SPEED;
        this.acceleration = CONFIG.PLAYER_ACCELERATION || 1.5;
        this.friction = CONFIG.PLAYER_FRICTION || 0.85;
        this.vx = 0;
        this.vy = 0;

        this.carryingItem = null;
        this.radius = CONFIG.PLAYER_RADIUS;
    }

    move(inputX, inputY, delta) {
        // Apply acceleration based on input
        if (inputX !== 0 || inputY !== 0) {
            // Normalize input vector if needed, but usually input is already normalized
            this.vx += inputX * this.acceleration * delta;
            this.vy += inputY * this.acceleration * delta;
        }

        // Apply friction
        this.vx *= this.friction;
        this.vy *= this.friction;

        // Cap velocity to max speed
        const currentSpeed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (currentSpeed > this.maxSpeed) {
            const scale = this.maxSpeed / currentSpeed;
            this.vx *= scale;
            this.vy *= scale;
        }

        // Apply velocity to position
        this.x += this.vx * delta;
        this.y += this.vy * delta;

        // Clamp to screen bounds
        this.x = Math.max(this.radius, Math.min(CONFIG.DESIGN_WIDTH - this.radius, this.x));
        this.y = Math.max(this.radius, Math.min(CONFIG.DESIGN_HEIGHT - this.radius, this.y));

        // Stop completely if speed is very low
        if (Math.abs(this.vx) < 0.1) this.vx = 0;
        if (Math.abs(this.vy) < 0.1) this.vy = 0;
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
        this.maxSpeed = CONFIG.PLAYER_SPEED * 0.6;

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
        this.maxSpeed = CONFIG.PLAYER_SPEED;

        // Restore visual
        this.gfx.tint = 0xffffff;

        return item;
    }
}
