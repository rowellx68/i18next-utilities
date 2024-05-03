import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  dts: true,
  minify: true,
  sourcemap: true,
  clean: true,
  bundle: true,
  format: ['cjs'],
})
