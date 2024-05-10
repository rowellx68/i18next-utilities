![MIT](https://img.shields.io/badge/License-MIT-green?style=flat-square)
![Version](https://img.shields.io/github/package-json/v/rowellx68/esbuild-plugin-i18next-loader?style=flat-square)
![CI](https://img.shields.io/github/actions/workflow/status/rowellx68/i18next-utilities/publish.yml?style=flat-square)

# `esbuild-plugin-i18next-loader`

esbuild plugin to client bundle i18next locales.

This plugin generates a virtual module that contains all the locales that are available in the project.

It is a rewrite of [alienfast/vite-plugin-i18next-loader](https://github.com/alienfast/vite-plugin-i18next-loader) to work with esbuild.

## Install

```bash
npm install --save-dev esbuild-plugin-i18next-loader

# or
pnpm add -D esbuild-plugin-i18next-loader

# or
yarn add -D esbuild-plugin-i18next-loader
```

## Options

| Name                  | Type                                           | Default                                  | Description                                     |
| --------------------- | ---------------------------------------------- | ---------------------------------------- | ----------------------------------------------- |
| `include`             | `('**/*.json' \| '**/*.yml' \| '**/*.yaml')[]` | `['**/*.json', '**/*.yml', '**/*.yaml']` | Glob patterns of files to include for bundling. |
| `namespaceResolution` | `basename`, `relativePath`                     | none                                     | Namespace resolution strategy.                  |
| `paths`               | `string[]`                                     | `[]`                                     | Locale top-level directory paths.               |

## Usage with esbuild

```js
import { i18nextPlugin } from 'esbuild-plugin-i18next-loader';

await esbuild.build({
  entryPoints: ['./src/index.ts'],
  write: true,
  bundle: true,
  plugins: [
    i18nextPlugin({
      namespaceResolution: 'basename',
      paths: ['./src/**/locales'],
    }),
  ],
});
```

## LICENSE

MIT
