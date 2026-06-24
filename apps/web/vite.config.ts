import { fileURLToPath, URL } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        tanstackRouter({ target: 'react', autoCodeSplitting: true }),
        react(),
        tailwindcss(),
        VitePWA({
            // Custom service worker (src/sw.ts) so we can handle Web Push
            // `push` / `notificationclick` events on top of Workbox precaching.
            strategies: 'injectManifest',
            srcDir: 'src',
            filename: 'sw.ts',
            registerType: 'autoUpdate',
            injectRegister: null, // registered manually in main.tsx
            manifest: {
                name: 'Necroloto',
                short_name: 'Necroloto',
                description: 'Le célèbre jeu de pronostics « celebrity death pool ».',
                lang: 'fr',
                start_url: '/',
                scope: '/',
                display: 'standalone',
                background_color: '#0B0B0F',
                theme_color: '#0B0B0F',
                icons: [
                    { src: '/pwa-192.png', sizes: '192x192', type: 'image/png' },
                    { src: '/pwa-512.png', sizes: '512x512', type: 'image/png' },
                    {
                        src: '/pwa-512-maskable.png',
                        sizes: '512x512',
                        type: 'image/png',
                        purpose: 'maskable',
                    },
                ],
            },
            injectManifest: {
                globPatterns: ['**/*.{js,css,html,svg,png,woff,woff2}'],
            },
            devOptions: { enabled: true, type: 'module' },
        }),
    ],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
        },
    },
    // @necroloto/shared is CommonJS; import scoring from its own module (not the
    // barrel, whose __exportStar re-export isn't statically analyzable by rollup).
    optimizeDeps: {
        include: ['@necroloto/shared/scoring'],
    },
    build: {
        // The shared package is a linked CJS workspace dep (outside node_modules),
        // so rollup's commonjs transform must be told to cover it too.
        commonjsOptions: {
            include: [/node_modules/, /packages\/shared/],
        },
    },
});
