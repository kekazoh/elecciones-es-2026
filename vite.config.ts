import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ command }) => ({
  plugins: [react()],
  // GitHub Pages sirve el sitio en https://<usuario>.github.io/<repo>/
  base: command === 'build' ? '/elecciones-es-2026/' : '/',
}));
