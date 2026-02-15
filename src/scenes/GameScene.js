import { Container, Graphics, Text, Ticker, TextStyle, TilingSprite, Assets, Rectangle } from 'pixi.js';
import { CONFIG } from '../config/GameConfig.js';
import { Player } from '../entities/Player.js';
import { Item } from '../entities/Item.js';
import { NPC } from '../entities/NPC.js';
import { InputHandler } from '../input/InputHandler.js';
import { BonusItem } from '../entities/BonusItem.js';
import { Joystick } from '../ui/Joystick.js';
import { TimerBar } from '../ui/TimerBar.js';
import { MathUtils } from '../utils/MathUtils.js';
import { MenuScene } from './MenuScene.js';

export class GameScene {
    constructor(game) {
        this.game = game;

        // Main container holds both world and UI
        this.container = new Container();

        // World Container (Background, Entities in Z-order)
        this.worldContainer = new Container();
        this.worldContainer.sortableChildren = true; // For entities Y-sorting if needed later
        this.container.addChild(this.worldContainer);

        // UI Container (Always on top)
        this.uiContainer = new Container();
        this.container.addChild(this.uiContainer);

        this.items = [];
        this.bonusItems = [];
        this.npcs = [];
        this.state = 'playing'; // playing, won, lost
        this.timeLeft = CONFIG.TIME_LIMIT;
        this.score = 0;

        this.isMobile = this.detectMobile();
    }

    detectMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 800;
    }

    init() {
        this.createBackground();
        this.spawnNPCs();
        this.spawnItems();
        this.spawnBonusItems();
        this.spawnPlayer();
        this.createUI();

        // Input
        this.input = new InputHandler();

        // Joystick (Mobile Only)
        if (this.isMobile) {
            this.createJoystick();
        }

        // Start Game Loop
        this.ticker = Ticker.shared;
        this.ticker.add(this.update, this);
    }

    createJoystick() {
        this.joystick = new Joystick({
            outerRadius: 60,
            innerRadius: 25,
            baseColor: 0xcccccc,
            stickColor: 0xffffff
        });

        // Position bottom-left
        this.joystick.x = 100;
        this.joystick.y = CONFIG.DESIGN_HEIGHT - 100;

        this.uiContainer.addChild(this.joystick);
        this.input.setJoystick(this.joystick);
    }

    createBackground() {
        try {
            const texture = Assets.get('grass');
            if (texture) {
                this.bg = new TilingSprite({
                    texture,
                    width: CONFIG.DESIGN_WIDTH,
                    height: CONFIG.DESIGN_HEIGHT
                });
            } else {
                // Fallback: Generate procedural grass texture
                const grassGfx = new Graphics();
                grassGfx.rect(0, 0, 64, 64).fill(0x2ecc71); // Base green

                // Add some "noise" blades of grass
                for (let i = 0; i < 20; i++) {
                    const x = Math.random() * 64;
                    const y = Math.random() * 64;
                    const h = 4 + Math.random() * 4;
                    grassGfx.moveTo(x, y).lineTo(x, y - h).stroke({ width: 1, color: 0x27ae60 });
                }

                // Create texture from graphics
                // Use a fixed region to strictly bound the texture to 64x64, ignoring any out-of-bounds strokes
                const grassTexture = this.game.app.renderer.generateTexture({
                    target: grassGfx,
                    frame: new Rectangle(0, 0, 64, 64)
                });

                this.bg = new TilingSprite({
                    texture: grassTexture,
                    width: CONFIG.DESIGN_WIDTH,
                    height: CONFIG.DESIGN_HEIGHT
                });
            }
        } catch (e) {
            this.bg = new Graphics()
                .rect(0, 0, CONFIG.DESIGN_WIDTH, CONFIG.DESIGN_HEIGHT)
                .fill(CONFIG.COLORS.BACKGROUND);
        }

        this.worldContainer.addChild(this.bg);
    }

    spawnPlayer() {
        this.player = new Player();
        this.player.x = CONFIG.DESIGN_WIDTH / 2;
        this.player.y = CONFIG.DESIGN_HEIGHT / 2;
        this.worldContainer.addChild(this.player);
    }

    spawnItems() {
        for (let i = 0; i < CONFIG.ITEM_COUNT; i++) {
            this.createItem();
        }
    }

    createItem() {
        const item = new Item();
        item.x = MathUtils.randomRange(100, CONFIG.DESIGN_WIDTH - 100);
        item.y = MathUtils.randomRange(200, CONFIG.DESIGN_HEIGHT - 200);
        this.worldContainer.addChild(item);
        this.items.push(item);
    }

    spawnBonusItems() {
        for (let i = 0; i < CONFIG.BONUS_ITEM_COUNT; i++) {
            this.createBonusItem();
        }
    }

    createBonusItem() {
        const item = new BonusItem();
        item.x = MathUtils.randomRange(100, CONFIG.DESIGN_WIDTH - 100);
        item.y = MathUtils.randomRange(200, CONFIG.DESIGN_HEIGHT - 200);
        this.worldContainer.addChild(item);
        this.bonusItems.push(item);
    }

    spawnNPCs() {
        const padding = 80;
        const topPadding = CONFIG.UI_TOP_MARGIN;
        const width = CONFIG.DESIGN_WIDTH;
        const height = CONFIG.DESIGN_HEIGHT;

        const positions = [
            { x: padding, y: topPadding }, // Top-Left
            { x: width - padding, y: topPadding }, // Top-Right
            { x: padding, y: height - padding }, // Bottom-Left
            { x: width - padding, y: height - padding } // Bottom-Right
        ];

        for (let i = 0; i < CONFIG.NPC_COUNT; i++) {
            const npc = new NPC();
            const pos = positions[i] || { x: width / 2, y: height / 2 };
            npc.x = pos.x;
            npc.y = pos.y;
            this.worldContainer.addChild(npc);
            this.npcs.push(npc);
        }
    }

    createUI() {
        const style = new TextStyle({
            fontFamily: 'Arial',
            fontSize: 36,
            fontWeight: 'bold',
            fill: CONFIG.COLORS.UI_TEXT
        });

        this.timerText = new Text({ text: `Time: ${this.timeLeft}`, style });
        this.timerText.x = 20;
        this.timerText.y = 20;
        this.uiContainer.addChild(this.timerText);

        // Score Text
        this.scoreText = new Text({ text: `Score: ${this.score} / ${CONFIG.SCORE_TARGET}`, style });
        this.scoreText.anchor.set(1, 0); // Top-right aligned
        this.scoreText.x = CONFIG.DESIGN_WIDTH - 20;
        this.scoreText.y = 20;
        this.uiContainer.addChild(this.scoreText);

        // Timer Bar
        this.timerBar = new TimerBar(CONFIG.TIME_LIMIT);
        this.timerBar.x = (CONFIG.DESIGN_WIDTH - this.timerBar.barWidth) / 2;
        this.timerBar.y = 70;
        this.uiContainer.addChild(this.timerBar);

        this.statusText = new Text({ text: '', style: { ...style, fontSize: 60, align: 'center' } });
        this.statusText.anchor.set(0.5);
        this.statusText.x = CONFIG.DESIGN_WIDTH / 2;
        this.statusText.y = CONFIG.DESIGN_HEIGHT / 2;
        this.statusText.visible = false;

        this.uiContainer.addChild(this.statusText);
    }

    update(ticker) {
        if (this.state !== 'playing') return;

        const delta = Math.min(ticker.deltaTime, 2.0); // Clamp delta to avoid huge jumps

        // 1. Update Timer
        this.timeLeft -= (ticker.deltaMS / 1000);
        const timeInt = Math.ceil(this.timeLeft);
        if (this.lastTimeInt !== timeInt) {
            this.timerText.text = `Time: ${timeInt}`;
            this.lastTimeInt = timeInt;
        }

        if (this.timerBar) {
            this.timerBar.update(this.timeLeft);
        }

        if (this.timeLeft <= 0) {
            this.gameOver(false);
            return;
        }

        // 2. Handle Input & Movement
        const movement = this.input.getMovement();
        if (movement.x !== 0 || movement.y !== 0) {
            this.player.move(movement.x, movement.y, delta);
        }

        // 3. Update Entities
        this.player.update(delta);
        this.items.forEach(item => item.update(delta));
        this.bonusItems.forEach(item => item.update(delta));
        this.npcs.forEach(npc => npc.update(delta));

        // 4. Check Collisions
        this.checkCollisions();
    }

    checkCollisions() {
        // Player vs Items
        if (!this.player.carryingItem) {
            for (let i = this.items.length - 1; i >= 0; i--) {
                const item = this.items[i];
                if (!item.visible) continue;

                if (MathUtils.checkCircleCollision(this.player, item)) {
                    if (this.player.pickup(item)) {
                        // Item picked up, remove from active items list
                        this.items.splice(i, 1);

                        // Respawn new item after 3s
                        setTimeout(() => this.createItem(), 3000);
                        break;
                    }
                }
            }
        }

        // Player vs Bonus Items
        for (let i = this.bonusItems.length - 1; i >= 0; i--) {
            const item = this.bonusItems[i];
            if (MathUtils.checkCircleCollision(this.player, item)) {
                // Collect logic
                this.timeLeft += CONFIG.BONUS_TIME_VALUE;
                if (this.timeLeft > CONFIG.TIME_LIMIT) this.timeLeft = CONFIG.TIME_LIMIT;

                item.destroy();
                this.bonusItems.splice(i, 1);

                // Respawn bonus item after 3s
                setTimeout(() => this.createBonusItem(), 3000);
            }
        }

        // Player vs NPCs
        // Can only deliver if carrying item
        if (this.player.carryingItem) {
            for (const npc of this.npcs) {
                if (npc.needsItem) {
                    if (MathUtils.checkCircleCollision(this.player, npc)) {
                        // Deliver!
                        const deliveredItem = this.player.deliver();
                        npc.receiveItem();

                        // Destroy item (cleanup)
                        if (deliveredItem) deliveredItem.destroy();

                        // Score Update
                        this.score += CONFIG.SCORE_PER_DELIVERY;
                        this.scoreText.text = `Score: ${this.score} / ${CONFIG.SCORE_TARGET}`;

                        this.checkWinCondition();
                        break;
                    }
                }
            }
        }
    }

    checkWinCondition() {
        if (this.score >= CONFIG.SCORE_TARGET) {
            this.gameOver(true);
        }
    }

    gameOver(win) {
        this.state = win ? 'won' : 'lost';

        if (win) {
            this.statusText.text = 'Вітаємо!\nВи розблокували значок\n"Сила Добра!"';
            this.statusText.style = new TextStyle({
                fontFamily: 'Arial',
                fontSize: 36, // Reduced font size for longer text
                fontWeight: 'bold',
                fill: 0x2ecc71, // Green
                align: 'center',
                stroke: { color: 0x000000, width: 4 }
            });
        } else {
            this.statusText.text = 'GAME OVER';
            this.statusText.style = new TextStyle({
                fontFamily: 'Arial',
                fontSize: 60,
                fontWeight: 'bold',
                fill: 0xe74c3c, // Red
                align: 'center',
                stroke: { color: 0x000000, width: 4 }
            });
        }

        this.statusText.visible = true;

        // Hide joystick
        if (this.joystick) this.joystick.visible = false;

        // Return to menu after delay
        setTimeout(() => {
            this.game.sceneManager.changeScene(new MenuScene(this.game));
        }, 4000); // Increased delay slightly to read message
    }

    destroy() {
        this.ticker.remove(this.update, this);
        this.container.destroy({ children: true });
    }
}
