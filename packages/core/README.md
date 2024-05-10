![MIT](https://img.shields.io/badge/License-MIT-green?style=flat-square)
![Version](https://img.shields.io/npm/v/i18next-utilities-core?style=flat-square)
![CI](https://img.shields.io/github/actions/workflow/status/rowellx68/i18next-utilities/publish.yml?style=flat-square)

# `i18next-utilities-core`

A collection of utilities that parses i18next resource files, concatenates them, and can generate TypeScript definitions for them.

## Methods

### `parseResourceFiles`

Parses i18next resource files for a list of directories and returns an object with the list of files, the concatenated resources, and the bundle for the default locale.

```ts
import { parseResourceFiles, I18NextTypedLogger } from 'i18next-utilities-core';

const logger: I18NextTypedLogger = {
  info: console.log,
  warn: console.warn,
  error: console.error,
};

const { files, bundle, defaultBundle } = parseResourceFiles(
  {
    paths: ['path/to/locales'],
    namespaceResolution: 'basename',
    defaultNamespace: 'translation',
    defaultLocale: 'en-Gb',
  },
  logger
);
```

### `generateResourceTypeDefinition`

Generates a TypeScript definition for the default locale bundle.

```ts
import { generateResourceTypeDefinition } from 'i18next-utilities-core';

const typeDefinition = generateResourceTypeDefinition(defaultLocaleBundle, {
  defaultNamespace: 'translation',
});
```

### `generateModuleTypeDefinition`

Generates a module definition. This is useful for plugins that might want to generate a virtual module.

```ts
import { generateModuleTypeDefinition } from 'i18next-utilities-core';

const moduleDefinition = generateModuleTypeDefinition(
  'vite:i18next-typed-loader',
  ['eb', 'en-GB']
);
```
