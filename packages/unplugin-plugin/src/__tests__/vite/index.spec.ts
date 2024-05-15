import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { build } from 'vite';
import plugin from '../../../dist/vite';

describe('i18next-typed-loader/vite', () => {
  it('should generate type definitions for default locale', async () => {
    const result = (await build({
      build: {
        lib: {
          entry: path.resolve(__dirname, '__fixtures__/entrypoint.ts'),
          formats: ['es'],
        },
        outDir: path.resolve(__dirname, '__fixtures__/dist'),
      },
      plugins: [
        plugin({
          namespaceResolution: 'basename',
          defaultLocale: 'en-GB',
          dtsOutputFile: path.resolve(
            __dirname,
            '__fixtures__/types/i18next.d.ts',
          ),
          virtualModuleDtsOutputFile: path.resolve(
            __dirname,
            '__fixtures__/types/i18next-virtual.d.ts',
          ),
          paths: [path.resolve(__dirname, '__fixtures__/locales/')],
          dts: {
            expand: true,
          },
        }),
      ],
    })) as any[];

    const output = result[0].output[0];
    const dts = fs.readFileSync(
      path.resolve(__dirname, '__fixtures__/types/i18next.d.ts'),
    );
    const virtualDts = fs.readFileSync(
      path.resolve(__dirname, '__fixtures__/types/i18next-virtual.d.ts'),
    );

    expect(output.code).toMatchSnapshot();
    expect(dts.toString()).toMatchSnapshot();
    expect(virtualDts.toString()).toMatchSnapshot();
  });

  it('should generate type definitions with expanded dts', async () => {
    const result = (await build({
      build: {
        lib: {
          entry: path.resolve(__dirname, '__fixtures__/entrypoint.ts'),
          formats: ['es'],
        },
        outDir: path.resolve(__dirname, '__fixtures__/dist'),
      },
      plugins: [
        plugin({
          namespaceResolution: 'basename',
          defaultLocale: 'en-GB',
          defaultNamespace: 'namespace',
          dtsOutputFile: path.resolve(
            __dirname,
            '__fixtures__/types/i18next-expanded.d.ts',
          ),
          virtualModuleDtsOutputFile: path.resolve(
            __dirname,
            '__fixtures__/types/i18next-virtual-expanded.d.ts',
          ),
          paths: [path.resolve(__dirname, '__fixtures__/locales/')],
        }),
      ],
    })) as any[];

    const output = result[0].output[0];
    const dts = fs.readFileSync(
      path.resolve(__dirname, '__fixtures__/types/i18next-expanded.d.ts'),
    );
    const virtualDts = fs.readFileSync(
      path.resolve(
        __dirname,
        '__fixtures__/types/i18next-virtual-expanded.d.ts',
      ),
    );

    expect(output.code).toMatchSnapshot();
    expect(dts.toString()).toMatchSnapshot();
    expect(virtualDts.toString()).toMatchSnapshot();
  });
});
