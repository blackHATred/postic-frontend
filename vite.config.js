import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import { resolve } from 'path';

// https://vitejs.dev/config/ дока конфигов
export default defineConfig({
  plugins: [react(), svgr()],
  base: './',
  build: {
    outDir: 'build', // по дефолту 'dist', но нужен 'build'
    sourcemap: false,
    rollupOptions: {
      input: {
        // eslint-disable-next-line no-undef
        main: resolve(__dirname, 'index.html'),
      },
    },
  },
  server: {
    host: true,
    port: 3000,
    strictPort: true, // Vite не будет выбирать другой порт при занятости 3000
  },
  preview: {
    port: 3000,
    host: true,
    strictPort: true,
    allowedHosts: ['postic.io', 'localhost'],
  },
  define: {
    // eslint-disable-next-line no-undef
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  publicDir: 'public',
});
