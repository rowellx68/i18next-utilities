import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import { build } from 'vite';
import plugin from '../index';

describe('vite-plugin-typed-i18next-loader', () => {
  it('should generate type definitions for default locale', async () => {
    const result = (await build({
      build: {
        lib: {
          entry: './src/__tests__/__fixtures__/entrypoint.ts',
          formats: ['es'],
        },
        outDir: './src/__tests__/__fixtures__/dist',
      },
      plugins: [
        plugin({
          namespaceResolution: 'basename',
          defaultLocale: 'en-GB',
          dtsOutputFile: './src/__tests__/__fixtures__/types/i18next.d.ts',
          paths: ['./src/__tests__/__fixtures__/locales/'],
        }),
      ],
    })) as any[];

    const output = result[0].output[0];
    const dts = fs.readFileSync('./src/__tests__/__fixtures__/types/i18next.d.ts')

    expect(output.code).toMatchSnapshot();
    expect(dts.toString()).toMatchSnapshot();
  });

  it('should generate type definitions with expanded dts', async () => {
    const result = (await build({
      build: {
        lib: {
          entry: './src/__tests__/__fixtures__/entrypoint.ts',
          formats: ['es'],
        },
        outDir: './src/__tests__/__fixtures__/dist',
      },
      plugins: [
        plugin({
          namespaceResolution: 'basename',
          defaultLocale: 'en-GB',
          dtsOutputFile:
            './src/__tests__/__fixtures__/types/i18next-expanded.d.ts',
          paths: ['./src/__tests__/__fixtures__/locales/'],
          dts: {
            expand: {
              arrays: true,
              ordinals: true,
              plurals: true,
            },
          },
        }),
      ],
    })) as any[];

    const output = result[0].output[0];
    const dts = fs.readFileSync('./src/__tests__/__fixtures__/types/i18next-expanded.d.ts')

    expect(output.code).toMatchSnapshot();
    expect(dts.toString()).toMatchSnapshot();
  });
});
