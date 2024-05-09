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
          virtualModuleDtsOutputFile:
            './src/__tests__/__fixtures__/types/i18next-virtual.d.ts',
          paths: ['./src/__tests__/__fixtures__/locales/'],
          dts: {
            expand: {
              arrays: false,
              contexts: false,
              ordinals: false,
              plurals: false,
            },
          },
        }),
      ],
    })) as any[];

    const output = result[0].output[0];
    const dts = fs.readFileSync(
      './src/__tests__/__fixtures__/types/i18next.d.ts',
    );
    const virtualDts = fs.readFileSync(
      './src/__tests__/__fixtures__/types/i18next-virtual.d.ts',
    );

    expect(output.code).toMatchSnapshot();
    expect(dts.toString()).toMatchSnapshot();
    expect(virtualDts.toString()).toMatchSnapshot();
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
          defaultNamespace: 'namespace',
          dtsOutputFile:
            './src/__tests__/__fixtures__/types/i18next-expanded.d.ts',
          virtualModuleDtsOutputFile:
            './src/__tests__/__fixtures__/types/i18next-virtual-expanded.d.ts',
          paths: ['./src/__tests__/__fixtures__/locales/'],
        }),
      ],
    })) as any[];

    const output = result[0].output[0];
    const dts = fs.readFileSync(
      './src/__tests__/__fixtures__/types/i18next-expanded.d.ts',
    );
    const virtualDts = fs.readFileSync(
      './src/__tests__/__fixtures__/types/i18next-virtual-expanded.d.ts',
    );

    expect(output.code).toMatchSnapshot();
    expect(dts.toString()).toMatchSnapshot();
    expect(virtualDts.toString()).toMatchSnapshot();
  });
});
