/* eslint-disable no-undef */
import { test, expect } from 'vitest';
import path from 'path';
import esbuild from 'esbuild';
import { i18nextPlugin } from '../index';
import { IncludePattern } from 'i18next-utilities-core';

test.each([
  { include: ['**/*.json'] as IncludePattern[] as IncludePattern[] },
  {
    include: ['**/*.yml', '**/*.yaml'] as IncludePattern[] as IncludePattern[],
  },
  { include: undefined },
])('no module resolution: %s', async ({ include }) => {
  const result = await esbuild.build({
    entryPoints: [path.resolve(__dirname, '__fixtures__/component.ts')],
    bundle: true,
    write: false,
    plugins: [
      i18nextPlugin({
        include: include,
        paths: [path.resolve(__dirname, '__fixtures__/locales')],
      }),
    ],
  });

  expect(result).toMatchSnapshot();
});

test.each([
  { include: ['**/*.json'] as IncludePattern[] },
  { include: ['**/*.yml', '**/*.yaml'] as IncludePattern[] },
  { include: undefined },
])('basename: %s', async ({ include }) => {
  const result = await esbuild.build({
    entryPoints: [path.resolve(__dirname, '__fixtures__/component.ts')],
    bundle: true,
    write: false,
    plugins: [
      i18nextPlugin({
        include: include,
        namespaceResolution: 'basename',
        paths: [path.resolve(__dirname, '__fixtures__/locales')],
      }),
    ],
  });

  expect(result).toMatchSnapshot();
});

test.each([
  { include: ['**/*.json'] as IncludePattern[] },
  { include: ['**/*.yml', '**/*.yaml'] as IncludePattern[] },
  { include: undefined },
])('relativePath: %s', async ({ include }) => {
  const result = await esbuild.build({
    entryPoints: [path.resolve(__dirname, '__fixtures__/component.ts')],
    bundle: true,
    write: false,
    plugins: [
      i18nextPlugin({
        include: include,
        namespaceResolution: 'relativePath',
        paths: [path.resolve(__dirname, '__fixtures__/locales')],
      }),
    ],
  });

  expect(result).toMatchSnapshot();
});

test.each([
  { include: ['**/*.json'] as IncludePattern[] },
  { include: ['**/*.yml', '**/*.yaml'] as IncludePattern[] },
  { include: undefined },
])('empty paths: %s', async ({ include }) => {
  const result = await esbuild.build({
    entryPoints: [path.resolve(__dirname, '__fixtures__/component.ts')],
    bundle: true,
    write: false,
    plugins: [
      i18nextPlugin({
        include: include,
        namespaceResolution: 'relativePath',
        paths: [],
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
      i18nextPlugin({
        include: [],
        namespaceResolution: 'relativePath',
        paths: [path.resolve(__dirname, '__fixtures__/locales')],
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
        i18nextPlugin({
          namespaceResolution: 'relativePath',
          paths: [path.resolve(__dirname, '__failing_fixtures__/locales')],
        }),
      ],
    });

  await expect(throwsError).rejects.toThrowError();
});
