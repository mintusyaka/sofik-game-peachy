import { Application, Assets } from 'pixi.js';
import { CONFIG } from '../config/GameConfig.js';
import { Responsive } from '../utils/Responsive.js';
import { SceneManager } from './SceneManager.js';
import { BootScene } from '../scenes/BootScene.js';

export class Game {
    constructor() {
        this.app = null;
        this.sceneManager = null;
    }

    async init() {
        // Create PixiJS Application
        this.app = new Application();

        await this.app.init({
            width: CONFIG.DESIGN_WIDTH,
            height: CONFIG.DESIGN_HEIGHT,
            backgroundColor: CONFIG.COLORS.BACKGROUND,
            antialias: true,
            resolution: window.devicePixelRatio || 1,
            autoDensity: true,
        });

        // Add canvas to DOM
        document.getElementById('app').appendChild(this.app.canvas);

        // Initialize Responsive utility
        Responsive.init(this.app);

        // Initialize Scene Manager
        this.sceneManager = new SceneManager(this.app);

        // Start with Boot Scene (or Menu directly if no assets)
        this.sceneManager.changeScene(new BootScene(this));

        // Debug
        console.log('Game Initialized');
    }
}
