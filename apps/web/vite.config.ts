import { fileURLToPath, URL } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
    plugins: [tanstackRouter({ target: 'react', autoCodeSplitting: true }), react(), tailwindcss()],
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
