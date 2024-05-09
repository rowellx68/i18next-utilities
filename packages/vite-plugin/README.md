![MIT](https://img.shields.io/badge/License-MIT-green?style=flat-square)
![Version](https://img.shields.io/github/package-json/v/rowellx68/vite-plugin-typed-i18next-loader?style=flat-square)
![CI](https://img.shields.io/github/actions/workflow/status/rowellx68/i18next-utilities/publish.yml?style=flat-square)

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
import i18nextPlugin from 'vite-plugin-typed-i18next-loader';
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

## Example

```json
// locales/en/translation.json
{
  "application": {
    "title": "My Application",
    "description": "This is my application"
  },
  "common": {
    "items_zero": "No items",
    "items_one": "{{count}} item",
    "items_other": "{{count}} items",
    "rank_one": "{{count}}st",
    "rank_two": "{{count}}nd",
    "rank_few": "{{count}}rd",
    "rank_other": "{{count}}th"
  }
}
```

```ts
// src/types/i18next.d.ts
import 'i18next';

type GeneratedResource = {
  translation: {
    'application.title': string;
    'application.description': string;
    'common.items': string;
    'common.rank': string;
  };
};

type FlatGeneratedResources<TResource, NS extends keyof TResource> = {
  [Property in keyof TResource[NS] as `${NS & string}:${Property & string}`]: TResource[NS][Property];
};

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: GeneratedResources & {
      translation: FlatGeneratedResources<GeneratedResources, 'translation'>;
    };
  }
}
```

## LICENSE

MIT
