import { readFileSync } from 'node:fs';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
const sourceHtml = readFileSync(new URL('./scripts/source-index.html', import.meta.url), 'utf8');
export default defineConfig({ plugins: [{ name: 'source-html', enforce: 'pre', transformIndexHtml: { order: 'pre', handler: () => sourceHtml } }, react()], base: './', build: { outDir: 'dist', rollupOptions: { output: { manualChunks(id) { if (id.includes('node_modules')) { if (id.includes('@supabase')) return 'supabase'; if (/node_modules\/(react|react-dom|scheduler)\//.test(id)) return 'react-vendor'; return 'vendor'; } } } } }, server: { port: 5173 } });
