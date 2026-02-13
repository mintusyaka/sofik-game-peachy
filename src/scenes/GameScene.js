import { Container, Graphics, Text, Ticker, TextStyle } from 'pixi.js';
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
        this.container = new Container();
        this.items = [];
        this.bonusItems = [];
        this.npcs = [];
        this.state = 'playing'; // playing, won, lost
        this.timeLeft = CONFIG.TIME_LIMIT;

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

        this.container.addChild(this.joystick);
        this.input.setJoystick(this.joystick);
    }

    createBackground() {
        this.bg = new Graphics()
            .rect(0, 0, CONFIG.DESIGN_WIDTH, CONFIG.DESIGN_HEIGHT)
            .fill(CONFIG.COLORS.BACKGROUND);
        this.container.addChild(this.bg);
    }

    spawnPlayer() {
        this.player = new Player();
        this.player.x = CONFIG.DESIGN_WIDTH / 2;
        this.player.y = CONFIG.DESIGN_HEIGHT / 2;
        this.container.addChild(this.player);
    }

    spawnItems() {
        for (let i = 0; i < CONFIG.ITEM_COUNT; i++) {
            const item = new Item();
            item.x = MathUtils.randomRange(100, CONFIG.DESIGN_WIDTH - 100);
            item.y = MathUtils.randomRange(200, CONFIG.DESIGN_HEIGHT - 200);
            this.container.addChild(item);
            this.items.push(item);
        }
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
        this.container.addChild(item);
        this.bonusItems.push(item);
    }

    spawnNPCs() {
        const padding = 80;
        const width = CONFIG.DESIGN_WIDTH;
        const height = CONFIG.DESIGN_HEIGHT;

        const positions = [
            { x: padding, y: padding }, // Top-Left
            { x: width - padding, y: padding }, // Top-Right
            { x: padding, y: height - padding }, // Bottom-Left
            { x: width - padding, y: height - padding } // Bottom-Right
        ];

        for (let i = 0; i < CONFIG.NPC_COUNT; i++) {
            const npc = new NPC();
            const pos = positions[i] || { x: width / 2, y: height / 2 };
            npc.x = pos.x;
            npc.y = pos.y;
            this.container.addChild(npc);
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
        this.container.addChild(this.timerText);

        // Timer Bar
        this.timerBar = new TimerBar(CONFIG.TIME_LIMIT);
        this.timerBar.x = (CONFIG.DESIGN_WIDTH - this.timerBar.barWidth) / 2;
        this.timerBar.y = 70;
        this.container.addChild(this.timerBar);

        this.statusText = new Text({ text: '', style: { ...style, fontSize: 60, align: 'center' } });
        this.statusText.anchor.set(0.5);
        this.statusText.x = CONFIG.DESIGN_WIDTH / 2;
        this.statusText.y = CONFIG.DESIGN_HEIGHT / 2;
        this.statusText.visible = false;
        this.container.addChild(this.statusText);
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

                setTimeout(() => this.createBonusItem(), 5000 + Math.random() * 5000);
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

                        this.checkWinCondition();
                        break;
                    }
                }
            }
        }
    }

    checkWinCondition() {
        const allSatisfied = this.npcs.every(npc => !npc.needsItem);
        if (allSatisfied) {
            this.gameOver(true);
        }
    }

    gameOver(win) {
        this.state = win ? 'won' : 'lost';
        this.statusText.text = win ? 'YOU WIN!' : 'GAME OVER';
        this.statusText.style.fill = win ? 0x2ecc71 : 0xe74c3c;
        this.statusText.visible = true;

        // Hide joystick
        if (this.joystick) this.joystick.visible = false;

        // Return to menu after delay
        setTimeout(() => {
            this.game.sceneManager.changeScene(new MenuScene(this.game));
        }, 3000);
    }

    destroy() {
        this.ticker.remove(this.update, this);
        this.container.destroy({ children: true });
    }
}
