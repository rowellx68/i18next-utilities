import { defineConfig } from 'tsup';

export default defineConfig({
  entryPoints: ['src/*.ts', 'src/vite/*.ts'],
  dts: true,
  clean: true,
  format: ['esm'],
});
