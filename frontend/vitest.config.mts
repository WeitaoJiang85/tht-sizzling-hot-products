import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
    plugins: [react(), tsconfigPaths()],
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: ['./vitest.setup.ts'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            exclude: [
                'node_modules/',
                'dist/',
                '.next/',
            ],
        },
    },
    resolve: {
        alias: {
            '@': path.resolve(process.cwd(), './'),
        },
    },
    esbuild: {
        jsx: 'automatic',
        jsxDev: true,
        loader: 'tsx',
    },
});
