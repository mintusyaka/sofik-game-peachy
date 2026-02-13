import { CONFIG } from '../config/GameConfig.js';

export class Responsive {
    static init(app) {
        this.app = app;
        window.addEventListener('resize', () => this.resize());
        this.resize();
    }

    static resize() {
        if (!this.app || !this.app.renderer) return;

        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;

        // Calculate scale to fit the design resolution into the viewport
        const scale = Math.min(
            screenWidth / CONFIG.DESIGN_WIDTH,
            screenHeight / CONFIG.DESIGN_HEIGHT
        );

        // Resize the renderer
        const newWidth = Math.floor(scale * CONFIG.DESIGN_WIDTH);
        const newHeight = Math.floor(scale * CONFIG.DESIGN_HEIGHT);

        this.app.renderer.resize(newWidth, newHeight);

        // Scale the stage to match design resolution
        this.app.stage.scale.set(scale);

        // Center the stage if needed (optional, depends on preference)
        // For this game, we'll keep 0,0 at top-left but effectively we are scaling the "camera"
    }

    static getScale() {
        if (!this.app) return 1;
        return this.app.stage.scale.x;
    }

    // Helper to convert screen coordinates to world coordinates
    static toWorld(x, y) {
        const scale = this.getScale();
        return {
            x: x / scale,
            y: y / scale
        };
    }
}
