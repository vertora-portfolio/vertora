import { defineConfig } from 'vite';

// base relativa: o site funciona em https://<usuario>.github.io/vertora/ e em qualquer outra pasta.
export default defineConfig({
  base: './',
  build: { assetsInlineLimit: 0, target: 'es2019' }
});
