import { defineConfig } from 'tsup';

export default defineConfig({
  entryPoints: ['src/index.ts'],
  format: ['esm'],
  clean: true,
  dts: false,
  minify: false,
});
