import { Assets } from 'pixi.js';

export class AssetLoader {
    static async loadAssets() {
        const assets = [
            { alias: 'player', src: '/assets/images/player.png' },
            { alias: 'item', src: '/assets/images/item.png' },
            { alias: 'npc', src: '/assets/images/npc.png' },
            // { alias: 'bonus', src: '/assets/images/bonus.png' },
        ];

        // We catch errors to prevent crash if files are missing
        try {
            await Assets.load(assets);
        } catch (e) {
            console.warn('Assets failed to load, falling back or check path', e);
        }
    }
}
