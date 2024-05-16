/* eslint-disable no-undef */
import { test, expect } from 'vitest';
import path from 'path';
import esbuild from 'esbuild';
import plugin from '../../../../dist/esbuild';
import { IncludePattern } from 'i18next-utilities-core';

test.each([
  { include: ['**/*.json'] as IncludePattern[] as IncludePattern[], index: 0 },
  {
    include: ['**/*.yml', '**/*.yaml'] as IncludePattern[] as IncludePattern[],
    index: 1,
  },
])('no module resolution: %s', async ({ include, index }) => {
  const result = await esbuild.build({
    entryPoints: [path.resolve(__dirname, '__fixtures__/component.ts')],
    bundle: true,
    write: false,
    plugins: [
      plugin({
        include: include,
        paths: [path.resolve(__dirname, '__fixtures__/locales')],
        defaultLocale: 'en-GB',
        dtsOutputFile: path.resolve(
          __dirname,
          `__fixtures__/types/i18next-no-module-resolution-${index}.d.ts`,
        ),
        virtualModuleDtsOutputFile: path.resolve(
          __dirname,
          `__fixtures__/types/i18next-virtual-no-module-resolution-${index}.d.ts`,
        ),
      }),
    ],
  });

  expect(result).toMatchSnapshot();
});

test.each([
  { include: ['**/*.json'] as IncludePattern[], index: 0 },
  { include: ['**/*.yml', '**/*.yaml'] as IncludePattern[], index: 1 },
  { include: undefined, index: 2 },
])('basename: %s', async ({ include, index }) => {
  const result = await esbuild.build({
    entryPoints: [path.resolve(__dirname, '__fixtures__/component.ts')],
    bundle: true,
    write: false,
    plugins: [
      plugin({
        include: include,
        namespaceResolution: 'basename',
        paths: [path.resolve(__dirname, '__fixtures__/locales')],
        defaultLocale: 'en-GB',
        dtsOutputFile: path.resolve(
          __dirname,
          `__fixtures__/types/i18next-basename-${index}.d.ts`,
        ),
        virtualModuleDtsOutputFile: path.resolve(
          __dirname,
          `__fixtures__/types/i18next-virtual-basename-${index}.d.ts`
        ),
      }),
    ],
  });

  expect(result).toMatchSnapshot();
});

test.each([
  { include: ['**/*.json'] as IncludePattern[], index: 0 },
  { include: ['**/*.yml', '**/*.yaml'] as IncludePattern[], index: 1 },
  { include: undefined, index: 2 },
])('relativePath: %s', async ({ include, index }) => {
  const result = await esbuild.build({
    entryPoints: [path.resolve(__dirname, '__fixtures__/component.ts')],
    bundle: true,
    write: false,
    plugins: [
      plugin({
        include: include,
        namespaceResolution: 'relativePath',
        paths: [path.resolve(__dirname, '__fixtures__/locales')],
        defaultLocale: 'en-GB',
        dtsOutputFile: path.resolve(
          __dirname,
          `__fixtures__/types/i18next-relative-${index}.d.ts`,
        ),
        virtualModuleDtsOutputFile: path.resolve(
          __dirname,
          `__fixtures__/types/i18next-virtual-relative-${index}.d.ts`,
        ),
      }),
    ],
  });

  expect(result).toMatchSnapshot();
});

test.each([
  { include: ['**/*.json'] as IncludePattern[], index: 0 },
  { include: ['**/*.yml', '**/*.yaml'] as IncludePattern[], index: 1 },
  { include: undefined, index: 2 },
])('empty paths: %s', async ({ include, index }) => {
  const result = await esbuild.build({
    entryPoints: [path.resolve(__dirname, '__fixtures__/component.ts')],
    bundle: true,
    write: false,
    plugins: [
      plugin({
        include: include,
        namespaceResolution: 'relativePath',
        defaultLocale: 'en-GB',
        paths: [],
        dtsOutputFile: path.resolve(
          __dirname,
          `__fixtures__/types/i18next-empty-paths-${index}.d.ts`,
        ),
        virtualModuleDtsOutputFile: path.resolve(
          __dirname,
          `__fixtures__/types/i18next-virtual-empty-paths-${index}.d.ts`,
        ),
      }),
    ],
  });

  expect(result).toMatchSnapshot();
});

test('empty includes', async () => {
  const result = await esbuild.build({
    entryPoints: [path.resolve(__dirname, '__fixtures__/component.ts')],
    bundle: true,
    write: false,
    plugins: [
      plugin({
        include: [],
        namespaceResolution: 'relativePath',
        paths: [path.resolve(__dirname, '__fixtures__/locales')],
        defaultLocale: 'en-GB',
        dtsOutputFile: path.resolve(
          __dirname,
          '__fixtures__/types/i18next-empty-includes.d.ts',
        ),
        virtualModuleDtsOutputFile: path.resolve(
          __dirname,
          '__fixtures__/types/i18next-virtual-empty-includes.d.ts',
        ),
      }),
    ],
  });

  expect(result).toMatchSnapshot();
});

test('throws exception when deserialising fails', async () => {
  const throwsError = async () =>
    await esbuild.build({
      entryPoints: [path.resolve(__dirname, '__fixtures__/component.ts')],
      bundle: true,
      write: false,
      plugins: [
        plugin({
          namespaceResolution: 'relativePath',
          paths: [path.resolve(__dirname, '__failing_fixtures__/locales')],
          defaultLocale: 'en-GB',
          dtsOutputFile: path.resolve(
            __dirname,
            '__fixtures__/types/i18next-failing.d.ts',
          ),
          virtualModuleDtsOutputFile: path.resolve(
            __dirname,
            '__fixtures__/types/i18next-virtual-failing.d.ts',
          ),
        }),
      ],
    });

  await expect(throwsError).rejects.toThrowError();
});
