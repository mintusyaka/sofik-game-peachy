import { Container } from 'pixi.js';

export class SceneManager {
    constructor(app) {
        this.app = app;
        this.currentScene = null;
        this.sceneContainer = new Container();
        this.app.stage.addChild(this.sceneContainer);
    }

    changeScene(newScene) {
        // Cleanup old scene
        if (this.currentScene) {
            if (this.currentScene.destroy) {
                this.currentScene.destroy();
            }
            this.sceneContainer.removeChild(this.currentScene.container);
        }

        // Set new scene
        this.currentScene = newScene;
        this.sceneContainer.addChild(this.currentScene.container);

        // Init new scene
        if (this.currentScene.init) {
            this.currentScene.init();
        }
    }

    update(delta) {
        if (this.currentScene && this.currentScene.update) {
            this.currentScene.update(delta);
        }
    }
}
