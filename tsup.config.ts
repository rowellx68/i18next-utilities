import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  dts: true,
  minify: false,
  sourcemap: true,
  clean: true,
  shims: true,
  bundle: false,
  target: 'node14',
  format: ['cjs', 'esm'],
})
