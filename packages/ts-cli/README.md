![MIT](https://img.shields.io/badge/License-MIT-green?style=flat-square)
![Version](https://img.shields.io/npm/v/i18next-utilities-ts-cli?style=flat-square)
![CI](https://img.shields.io/github/actions/workflow/status/rowellx68/i18next-utilities/publish.yml?style=flat-square)

# `i18next-utilities-ts-cli`

A CLI tool to generate TypeScript types for i18next based on your resource files. Point it to your default locale and it will generate types from `.json`, `.yaml`, or `.yml` files.

## Usage

```bash
npx i18next-utilities-ts-cli gen -i ./path/to/locales/en-GB -o ./i18next.d.ts
```

## Options

| Option                         | Type                           | Default                                | Description                                   |
| ------------------------------ | ------------------------------ | -------------------------------------- | --------------------------------------------- |
| `-i`, `--input`                | `string`                       |                                        | The input directory for the default locale.   |
| `-o`, `--output`               | `string`                       |                                        | The output file for the generated types.      |
| `-l`, `--default-locale`       | `string`                       |                                        | The default locale for the resource files.    |
| `-g`, `--glob`                 | `string[]`                     | `["**/*.json","**/*.yml","**/*.yaml"]` | The glob pattern to match the resource files. |
| `-n`, `--namespace-resolution` | `"basename"`, `"relativePath"` | `"basename"`                           | The resolution strategy for the namespace.    |
| `-d`, `--default-namespace`    | `string`                       | `"translation"`                        | The default namespace for the resource files. |
