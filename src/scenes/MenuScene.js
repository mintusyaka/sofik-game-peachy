import { Container, Text, TextStyle, Graphics } from 'pixi.js';
import { CONFIG } from '../config/GameConfig.js';
import { GameScene } from './GameScene.js';

export class MenuScene {
    constructor(game) {
        this.game = game;
        this.container = new Container();
    }

    init() {
        // Background
        const bg = new Graphics()
            .rect(0, 0, CONFIG.DESIGN_WIDTH, CONFIG.DESIGN_HEIGHT)
            .fill(CONFIG.COLORS.BACKGROUND);
        this.container.addChild(bg);

        // Title
        const titleStyle = new TextStyle({
            fontFamily: 'Arial',
            fontSize: 60,
            fontWeight: 'bold',
            fill: CONFIG.COLORS.UI_TEXT,
            align: 'center',
        });

        const title = new Text({ text: 'Pick & Deliver', style: titleStyle });
        title.anchor.set(0.5);
        title.x = CONFIG.DESIGN_WIDTH / 2;
        title.y = CONFIG.DESIGN_HEIGHT * 0.3;
        this.container.addChild(title);

        // Instructions
        const instrStyle = new TextStyle({
            fontFamily: 'Arial',
            fontSize: 30,
            fill: CONFIG.COLORS.UI_TEXT,
            align: 'center',
            wordWrap: true,
            wordWrapWidth: CONFIG.DESIGN_WIDTH * 0.8
        });

        const instructions = new Text({
            text: 'Tap to move.\nPick up items.\nDeliver to NPCs.\n\n10 Seconds to Win!',
            style: instrStyle
        });
        instructions.anchor.set(0.5);
        instructions.x = CONFIG.DESIGN_WIDTH / 2;
        instructions.y = CONFIG.DESIGN_HEIGHT * 0.5;
        this.container.addChild(instructions);

        // Start Button (Tap anywhere)
        const startText = new Text({
            text: 'Tap to Start',
            style: { ...titleStyle, fontSize: 40 }
        });
        startText.anchor.set(0.5);
        startText.x = CONFIG.DESIGN_WIDTH / 2;
        startText.y = CONFIG.DESIGN_HEIGHT * 0.8;
        this.container.addChild(startText);

        // Pulse animation helper
        this.startText = startText;
        this.time = 0;

        // Interactive background for tap
        bg.eventMode = 'static';
        bg.cursor = 'pointer';
        bg.on('pointerdown', () => this.startGame());
    }

    startGame() {
        this.game.sceneManager.changeScene(new GameScene(this.game));
    }

    update(delta) {
        // Pulse start text
        this.time += 0.05;
        this.startText.scale.set(1 + Math.sin(this.time) * 0.05);
    }

    destroy() {
        this.container.destroy({ children: true });
    }
}
