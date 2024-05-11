#!/usr/bin/env node
import { program, createOption } from 'commander';
import {
  generateResourceTypeDefinition,
  parseResourceFiles,
} from 'i18next-utilities-core';
import fs from 'fs';
import packageJson from '../package.json';

const binName = Object.keys(packageJson.bin)[0];

program
  .name(binName)
  .version(packageJson.version)
  .description(packageJson.description);

const inputOption = createOption(
  '-i, --input <input...>',
  'The input directory for the locales.'
).makeOptionMandatory(true);

const outputOption = createOption(
  '-o, --output <output>',
  'The destination for the output file.'
).makeOptionMandatory(true);

const defaultLocaleOption = createOption(
  '-l, --default-locale <defaultLocale>',
  'The default locale.'
).makeOptionMandatory(true);

const globOption = createOption(
  '-g, --glob <glob...>',
  'The glob pattern for resource files.'
)
  .default(['**/*.json', '**/*.yml', '**/*.yaml'])
  .choices(['**/*.json', '**/*.yml', '**/*.yaml']);

const namespaceResolutionOption = createOption(
  '-n, --namespace-resolution <namespaceResolution>',
  'The namespace resolution strategy.'
)
  .default('basename')
  .choices(['basename', 'relativePath']);

const defaultNamespaceOption = createOption(
  '-d, --default-namespace <defaultNamespace>',
  'The default namespace.'
).default('translation');

program
  .command('gen')
  .description('Generate TypeScript type definition for i18next resources.')
  .addOption(inputOption)
  .addOption(outputOption)
  .addOption(defaultLocaleOption)
  .addOption(globOption)
  .addOption(namespaceResolutionOption)
  .addOption(defaultNamespaceOption)
  .action(
    ({
      input,
      output,
      defaultLocale,
      glob,
      namespaceResolution,
      defaultNamespace,
    }) => {
      const loggerPrefix = `[${binName}]`;

      const logger = {
        info: (message: string) => console.log(`${loggerPrefix} ${message}`),
        warn: (message: string) => console.warn(`${loggerPrefix} ${message}`),
        error: (message: string) => console.error(`${loggerPrefix} ${message}`),
      };

      const { defaultBundle } = parseResourceFiles(
        {
          paths: input,
          include: glob,
          defaultLocale: defaultLocale,
          namespaceResolution: namespaceResolution,
        },
        logger
      );

      if (!defaultBundle) {
        logger.warn(
          'Attempted to generate type definition but no resources found.'
        );
        return;
      }

      const definition = generateResourceTypeDefinition(defaultBundle, {
        defaultNamespace: defaultNamespace,
      });

      fs.writeFileSync(output, definition, { encoding: 'utf-8' });

      logger.info('Type definition generated successfully.');
    }
  );

program.parse();
