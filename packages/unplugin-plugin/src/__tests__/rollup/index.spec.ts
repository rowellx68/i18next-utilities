import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { rollup } from 'rollup';
import plugin from '../../../dist/rollup';

describe('i18next-typed-loader/rollup', () => {
  it('should generate type definitions for default locale', async () => {
    const result = await rollup({
      input: path.resolve(__dirname, '__fixtures__/entrypoint.ts'),
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
        })
      ],
    });

    const { output } = await result.generate({ format: 'es' });
    const dts = fs.readFileSync(
      path.resolve(__dirname, '__fixtures__/types/i18next.d.ts'),
    );
    const virtualDts = fs.readFileSync(
      path.resolve(__dirname, '__fixtures__/types/i18next-virtual.d.ts'),
    );

    expect(output[0].code).toMatchSnapshot();
    expect(dts.toString()).toMatchSnapshot();
    expect(virtualDts.toString()).toMatchSnapshot();
  });

  it('should generate type definitions with expanded dts', async () => {
    const result = await rollup({
      input: path.resolve(__dirname, '__fixtures__/entrypoint.ts'),
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
    });

    const { output } = await result.generate({ format: 'es' });
    const dts = fs.readFileSync(
      path.resolve(__dirname, '__fixtures__/types/i18next-expanded.d.ts'),
    );
    const virtualDts = fs.readFileSync(
      path.resolve(
        __dirname,
        '__fixtures__/types/i18next-virtual-expanded.d.ts',
      ),
    );

    expect(output[0].code).toMatchSnapshot();
    expect(dts.toString()).toMatchSnapshot();
    expect(virtualDts.toString()).toMatchSnapshot();
  });
});
