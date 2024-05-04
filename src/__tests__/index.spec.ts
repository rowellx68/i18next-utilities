import { describe, it, expect } from 'vitest';
import { build } from 'vite';
import plugin from '../index';

describe('vite-plugin-typed-i18next-loader', () => {
  it('should generate type definitions for default locale', async () => {
    const result = await build({
      build: {
        lib: {
          entry: './src/__tests__/__fixtures__/entrypoint.ts',
          formats: ['es']
        },
        outDir: './src/__tests__/__fixtures__/dist'
      },
      plugins: [plugin({
        namespaceResolution: 'basename',
        defaultLocale: 'en-GB',
        output: './src/__tests__/__fixtures__/types/i18next.d.ts',
        paths: ['./src/__tests__/__fixtures__/locales/'],
      })],
    }) as any[];

    const output = result[0].output[0]

    expect(output.code).toMatchSnapshot();
  });
});
