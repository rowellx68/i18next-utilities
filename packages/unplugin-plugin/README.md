![MIT](https://img.shields.io/badge/License-MIT-green?style=flat-square)
![Version](https://img.shields.io/npm/v/i18next-utilities-unplugin?style=flat-square)
![CI](https://img.shields.io/github/actions/workflow/status/rowellx68/i18next-utilities/publish.yml?style=flat-square)

# `i18next-utilities-unplugin`

This plugin will generate a virtual module that exports the compiled resources for i18next and will also generate a type definition file for the resources.

Majority of the code for this plugin is from [alienfast/vite-plugin-i18next-loader](https://github.com/alienfast/vite-plugin-i18next-loader).

## Supported Bundlers

- Vite
- Rollup
- Webpack
- esbuild
- Farm

## Install

```bash
npm install --save-dev i18next-utilities-unplugin

# or
pnpm add -D i18next-utilities-unplugin

# or

yarn add -D i18next-utilities-unplugin
```

## Options

| Name                         | Type                                           | Default                                  | Description                                                     |
| ---------------------------- | ---------------------------------------------- | ---------------------------------------- | --------------------------------------------------------------- |
| `defaultLocale`              | `string`                                       | `'en'`                                   | The default locale the plugin will generate the type from.      |
| `defaultNamespace`           | `string`                                       | `'translation'`                          | The default i18next namespace the plugin will use.              |
| `include`                    | `('**/*.json' \| '**/*.yml' \| '**/*.yaml')[]` | `['**/*.json', '**/*.yml', '**/*.yaml']` | Glob patterns of files to include for bundling.                 |
| `namespaceResolution`        | `basename`, `relativePath`                     | none                                     | Namespace resolution strategy.                                  |
| `dtsOutputFile`              | `string`                                       | `'./src/types/i18next.d.ts'`             | Output file destination for the generated types.                |
| `virtualModuleDtsOutputFile` | `string`                                       | `'./src/types/i18next-virtual.d.ts'`     | Output file destination for the generated virtual module types. |
| `paths`                      | `string[]`                                     | `[]`                                     | Locale top-level directory paths.                               |
| `dts`                        | `{ expand: boolean }`                          | `{ expand: true }`                       | DTS generation options.                                         |

## Usage with Vite

```js
import i18nextPlugin from 'i18next-utilities-unplugin/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    i18nextPlugin({
      defaultLocale: 'en-GB',
      defaultNamespace: 'translation',
      paths: ['./src/locales/'],
      namespaceResolution: 'basename',
      dtsOutputFile: './src/types/i18next.d.ts',
      virtualModuleDtsOutputFile: './src/types/i18next-virtual.d.ts',
    }),
  ],
});
```

## Usage with Rollup

```js
import i18nextPlugin from 'i18next-utilities-unplugin/rollup';

export default {
  input: 'src/index.js',
  output: {
    file: 'dist/bundle.js',
    format: 'es',
  },
  plugins: [
    i18nextPlugin({
      defaultLocale: 'en-GB',
      defaultNamespace: 'translation',
      paths: ['./src/locales/'],
      namespaceResolution: 'basename',
      dtsOutputFile: './src/types/i18next.d.ts',
      virtualModuleDtsOutputFile: './src/types/i18next-virtual.d.ts',
    }),
  ],
};
```

## Usage with Webpack

```js
const I18NextTypedPlugin = require('i18next-utilities-unplugin/webpack');

module.exports = {
  plugins: [
    new I18NextTypedPlugin({
      defaultLocale: 'en-GB',
      defaultNamespace: 'translation',
      paths: ['./src/locales/'],
      namespaceResolution: 'basename',
      dtsOutputFile: './src/types/i18next.d.ts',
      virtualModuleDtsOutputFile: './src/types/i18next-virtual.d.ts',
    }),
  ],
};
```

## Usage with i18next

```ts
import resources from 'virtual:i18next-typed-loader';
import i18n from 'i18next';

i18n.init({
  defaultNS: 'translation',
  resources: resources,
  ns: ['translation'],
});
```
