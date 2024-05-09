#!/usr/bin/env node
import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';
import {
  type IncludePattern,
  generateResourceTypeDefinition,
  parseResourceFiles,
} from 'i18next-utilities-core';
import fs from 'fs';

const { input, output, glob, namespaceResolution, defaultNamespace } = yargs(
  hideBin(process.argv)
)
  .scriptName('i18next-util-ts-cli')
  .usage('Usage: $0 -i [input] -o [output]')
  .options({
    input: {
      array: true,
      string: true,
      alias: 'i',
      description: 'The input file or directory where for the locales.',
      required: true,
    },
    output: {
      string: true,
      alias: 'o',
      description: 'The destination for the output file.',
      required: true,
    },
    glob: {
      array: true,
      string: true,
      alias: 'g',
      default: ['**/*.json', '**/*.yml', '**/*.yaml'],
      choices: ['**/*.json', '**/*.yml', '**/*.yaml'],
    },
    namespaceResolution: {
      string: true,
      alias: 'n',
      default: 'basename',
      choices: ['basename', 'relativePath'],
    },
    defaultNamespace: {
      string: true,
      alias: 'd',
      default: 'translation',
    },
  })
  .coerce('glob', (glob: string[]) => glob.map((g) => g as IncludePattern))
  .coerce(
    'namespaceResolution',
    (namespaceResolution: string) =>
      namespaceResolution as 'basename' | 'relativePath'
  )
  .parseSync();

const loggerPrefix = '[i18next-util-ts-cli]';

const logger = {
  info: (message: string) => console.log(`${loggerPrefix} ${message}`),
  warn: (message: string) => console.warn(`${loggerPrefix} ${message}`),
  error: (message: string) => console.error(`${loggerPrefix} ${message}`),
};

const { defaultBundle } = parseResourceFiles(
  { paths: input, include: glob, namespaceResolution: namespaceResolution },
  logger
);

const definition = generateResourceTypeDefinition(defaultBundle, {
  defaultNamespace: defaultNamespace,
});

fs.writeFileSync(output, definition, { encoding: 'utf-8' });

logger.info('Type definition generated successfully.');
