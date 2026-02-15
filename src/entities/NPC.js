import { Container, Sprite, Graphics } from 'pixi.js';
import { CONFIG } from '../config/GameConfig.js';

export class NPC extends Container {
    constructor() {
        super();

        this.radius = CONFIG.NPC_RADIUS;
        this.needsItem = true;

        // Movement state
        this.state = 'idle'; // 'idle', 'moving', 'satisfied'
        this.idleTimer = 0;
        this.moveTarget = { x: 0, y: 0 };
        this.moveSpeed = CONFIG.PLAYER_SPEED * 0.2; // Slower
        this.maxMoveDistance = 200; // Longer range
        this.homePos = { x: 0, y: 0 }; // Will be set on first update if not set
        this.wobbleTime = 0;

        // Cooldown state
        this.cooldownTimer = 0;

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

        // Cooldown Bar
        this.cooldownBar = new Container();
        this.cooldownBar.y = -this.radius - 40;
        this.cooldownBar.visible = false;
        this.addChild(this.cooldownBar);

        // Cooldown Bar Background
        const bg = new Graphics()
            .rect(-30, 0, 60, 10)
            .fill(0x333333)
            .stroke({ width: 2, color: 0x000000 });
        this.cooldownBar.addChild(bg);

        // Cooldown Bar Fill
        this.cooldownFill = new Graphics();
        this.cooldownBar.addChild(this.cooldownFill);
    }

    update(delta) {
        if (!this.homePos.x && this.x) {
            this.homePos = { x: this.x, y: this.y };
        }

        // Heart Animation
        if (this.heart.visible) {
            this.heart.rotation = Math.sin(Date.now() * 0.02) * 0.2; // Shake
        }

        // Cooldown Logic
        if (this.state === 'satisfied') {
            this.cooldownTimer -= delta * 16.66; // Convert delta (ticks) to ms approximation? Or just use delta directly if delta is in seconds? 
            // Pixi ticker.deltaTime is strictly frame-based. Scene passes delta.
            // Let's assume GameScene passes delta in "frame factor" where 1.0 = 60fps.
            // So delta * 16.66 ~= ms. 
            // Wait, GameScene uses ticker.deltaMS for timer. Let's rely on standard ticker usage or passed delta.
            // GameScene passes 'delta' derived from ticker.deltaTime.

            // Actually, let's use a simpler decrement based on frame count or pass actual time delta.
            // For now, let's assume update(delta) receives collision-step delta.
            // To be precise, let's modify update signature in GameScene if needed, or just standard decrement.
            // If delta is 1.0 (60fps), we need to decrement 16.6ms.
            this.cooldownTimer -= (delta * 16.666);

            if (this.cooldownTimer <= 0) {
                this.resetToIdle();
            } else {
                // Update Bar
                const ratio = this.cooldownTimer / CONFIG.NPC_COOLDOWN;
                this.cooldownFill.clear()
                    .rect(-28, 2, 56 * ratio, 6)
                    .fill(0x3498db);
            }
            return; // Don't move while satisfied
        }

        if (this.state === 'idle') {
            this.handleIdle(delta);
        } else if (this.state === 'moving') {
            this.handleMoving(delta);
        }
    }

    resetToIdle() {
        this.state = 'idle';
        this.needsItem = true;
        this.sprite.tint = 0xffffff;
        this.heart.visible = false;
        this.cooldownBar.visible = false;

        // Remove item sprite if any
        // The last child added in receiveItem was the item sprite
        // But we have other children now (cooldownBar).
        // Let's track the item sprite reference.
        if (this.heldItemSprite) {
            this.removeChild(this.heldItemSprite);
            this.heldItemSprite = null;
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
            const topMargin = Math.max(margin, CONFIG.UI_TOP_MARGIN);

            this.moveTarget.x = Math.max(margin, Math.min(CONFIG.DESIGN_WIDTH - margin, this.moveTarget.x));
            this.moveTarget.y = Math.max(topMargin, Math.min(CONFIG.DESIGN_HEIGHT - margin, this.moveTarget.y));

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

        // Cooldown init
        this.cooldownTimer = CONFIG.NPC_COOLDOWN;
        this.cooldownBar.visible = true;

        // Show Held Item
        const itemSprite = Sprite.from('item');
        itemSprite.anchor.set(0.5);
        itemSprite.width = CONFIG.ITEM_RADIUS * 2; // Match item size...
        itemSprite.height = CONFIG.ITEM_RADIUS * 2;
        // ...or make it slightly smaller visually relative to NPC
        itemSprite.scale.set(itemSprite.scale.x * 0.8);

        this.addChild(itemSprite);
        this.heldItemSprite = itemSprite; // Store ref to remove later
    }
}
