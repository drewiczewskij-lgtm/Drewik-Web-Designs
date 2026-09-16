import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath, URL } from 'node:url';

/**
 * `single` collapses the whole site into one file that runs from a double
 * click: no code splitting, no separate stylesheet, every asset inlined.
 * Everything else builds normally.
 */
const single = process.env.VITE_SINGLE === '1';

export default defineConfig({
  // A relative base lets the built site be served from any subdirectory.
  base: process.env.VITE_BASE ?? '/',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    target: 'es2022',
    cssTarget: 'chrome111',
    outDir: single ? 'dist-single' : 'dist',
    cssCodeSplit: !single,
    assetsInlineLimit: single ? 100_000_000 : 2048,
    rollupOptions: {
      output: single
        ? { inlineDynamicImports: true }
        : {
            manualChunks(id: string) {
              if (
                id.includes('node_modules/motion') ||
                id.includes('node_modules/framer-motion')
              ) {
                return 'motion';
              }
              if (id.includes('node_modules/react-router')) return 'router';
              if (id.includes('node_modules/lenis')) return 'scroll';
              return undefined;
            },
          },
    },
  },
});
