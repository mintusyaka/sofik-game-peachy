import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    base: '/sofik-game-peachy/', // Set the base path for GitHub Pages
    server: {
        host: true, // Listen on all local IPs
        port: 5173,
    },
});
