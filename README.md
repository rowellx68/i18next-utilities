![MIT](https://img.shields.io/badge/License-MIT-green?style=flat-square)
![Version](https://img.shields.io/github/package-json/v/rowellx68/vite-plugin-typed-i18next-loader?style=flat-square)
![CI](https://img.shields.io/github/actions/workflow/status/rowellx68/vite-plugin-typed-i18next-loader/publish.yml?style=flat-square)

# `vite-plugin-typed-i18next-loader`

This plugin will generate a virtual module that exports the compiled resources for i18next and will also generate a type definition file for the resources.

Majority of the code for this plugin is from [alienfast/vite-plugin-i18next-loader](https://github.com/alienfast/vite-plugin-i18next-loader).

## Install

```bash
npm install --save-dev vite-plugin-typed-i18next-loader

# or
pnpm add -D vite-plugin-typed-i18next-loader

# or
yarn add -D vite-plugin-typed-i18next-loader
```

## Options

| Name                  | Type                                           | Default                                  | Description                                                |
| --------------------- | ---------------------------------------------- | ---------------------------------------- | ---------------------------------------------------------- |
| `defaultLocale`       | `string`                                       | `'en'`                                   | The default locale the plugin will generate the type from. |
| `defaultNamespace`    | `string`                                       | `'translation'`                          | The default i18next namespace the plugin will use.         |
| `include`             | `('**/*.json' \| '**/*.yml' \| '**/*.yaml')[]` | `['**/*.json', '**/*.yml', '**/*.yaml']` | Glob patterns of files to include for bundling.            |
| `namespaceResolution` | `basename`, `relativePath`                     | none                                     | Namespace resolution strategy.                             |
| `output`              | `string`                                       | `'./src/types/i18next.d.ts'`             | Output file name and path.                                 |
| `paths`               | `string[]`                                     | `[]`                                     | Locale top-level directory paths.                          |

## Usage with Vite

```js
import i18nextPlugin from 'vite-plugin-typed-i18next-loader';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    i18nextPlugin({
      defaultLocale: 'en-GB',
      defaultNamespace: 'translation',
      include: ['**/locales/**/*.json'],
      namespaceResolution: 'basename',
      output: './src/types/i18next.d.ts',
    }),
  ],
});
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

## LICENSE

MIT
