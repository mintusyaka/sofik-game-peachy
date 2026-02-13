import { Container, Sprite, Graphics } from 'pixi.js';
import { CONFIG } from '../config/GameConfig.js';

export class NPC extends Container {
    constructor() {
        super();

        this.radius = CONFIG.NPC_RADIUS;
        this.needsItem = true;

        // Movement state
        this.state = 'idle'; // 'idle', 'moving'
        this.idleTimer = 0;
        this.moveTarget = { x: 0, y: 0 };
        this.moveSpeed = CONFIG.PLAYER_SPEED * 0.2; // Slower
        this.maxMoveDistance = 200; // Longer range
        this.homePos = { x: 0, y: 0 }; // Will be set on first update if not set
        this.wobbleTime = 0;

        // Visuals
        this.sprite = Sprite.from('npc');
        this.sprite.anchor.set(0.5);
        this.sprite.width = this.radius * 2;
        this.sprite.height = this.radius * 2;
        this.addChild(this.sprite);

        // Heart (Hidden by default)
        this.heart = new Graphics();
        this.heart.moveTo(0, 0);
        this.heart.bezierCurveTo(-10, -10, -20, 5, 0, 20);
        this.heart.bezierCurveTo(20, 5, 10, -10, 0, 0);
        this.heart.fill(0xff0000);
        this.heart.y = -this.radius - 20;
        this.heart.scale.set(0.8);
        this.heart.visible = false;
        this.addChild(this.heart);
    }

    update(delta) {
        if (!this.homePos.x && this.x) {
            this.homePos = { x: this.x, y: this.y };
        }

        // Heart Animation
        if (this.heart.visible) {
            this.heart.rotation = Math.sin(Date.now() * 0.02) * 0.2; // Shake
        }

        if (this.state === 'idle') {
            this.handleIdle(delta);
        } else if (this.state === 'moving') {
            this.handleMoving(delta);
        }
    }

    handleIdle(delta) {
        this.idleTimer -= delta;
        if (this.idleTimer <= 0) {
            // Pick new target
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * this.maxMoveDistance;

            this.moveTarget.x = this.homePos.x + Math.cos(angle) * distance;
            this.moveTarget.y = this.homePos.y + Math.sin(angle) * distance;

            // Clamp to screen bounds
            const margin = this.radius + 10;
            this.moveTarget.x = Math.max(margin, Math.min(CONFIG.DESIGN_WIDTH - margin, this.moveTarget.x));
            this.moveTarget.y = Math.max(margin, Math.min(CONFIG.DESIGN_HEIGHT - margin, this.moveTarget.y));

            this.state = 'moving';
            this.wobbleTime = 0;
        }
    }

    handleMoving(delta) {
        const dx = this.moveTarget.x - this.x;
        const dy = this.moveTarget.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 5) {
            // Reached target
            this.state = 'idle';
            this.idleTimer = 60 + Math.random() * 120; // 1-3 seconds wait (assuming 60fps)
            this.sprite.rotation = 0;
            return;
        }

        // Move
        const moveDist = this.moveSpeed * delta;
        this.x += (dx / dist) * moveDist;
        this.y += (dy / dist) * moveDist;

        // Wobble Animation
        this.wobbleTime += delta * 0.2;
        this.sprite.rotation = Math.sin(this.wobbleTime) * 0.2; // +/- 0.2 radians
    }

    receiveItem() {
        this.needsItem = false;
        this.state = 'satisfied'; // Stop movement
        this.sprite.rotation = 0; // Reset rotation
        this.sprite.tint = CONFIG.COLORS.NPC_SATISFIED;
        this.heart.visible = true;

        // Show Held Item
        const itemSprite = Sprite.from('item');
        itemSprite.anchor.set(0.5);
        itemSprite.width = CONFIG.ITEM_RADIUS * 2; // Match item size...
        itemSprite.height = CONFIG.ITEM_RADIUS * 2;
        // ...or make it slightly smaller visually relative to NPC
        itemSprite.scale.set(itemSprite.scale.x * 0.8);

        this.addChild(itemSprite);
    }
}
