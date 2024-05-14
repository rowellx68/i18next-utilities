import path from 'path';
import fs from 'fs';
import YAML from 'yaml';
import * as deep from 'ts-deepmerge';
import * as prop from 'dot-prop';
import type { Resource } from 'i18next';
import type {
  I18NextTypedLogger,
  I18NextTypedOptions,
  IncludePattern,
} from './types';
import {
  resolvePaths,
  assertExistence,
  enumerateLanguages,
  findAllFiles,
} from './utilities';

const defaultIncludes: IncludePattern[] = [
  '**/*.json',
  '**/*.yml',
  '**/*.yaml',
];

const allowedExtensions = ['.json', '.yml', '.yaml'];

export const parseResourceFiles = (
  options: I18NextTypedOptions,
  logger: I18NextTypedLogger
) => {
  const directories = resolvePaths(options.paths, process.cwd());
  const files: string[] = [];

  assertExistence(directories);

  const uniqueIncludes = Array.from(
    new Set(options.include ?? defaultIncludes)
  );

  if (options.paths.length === 0) {
    logger.warn('No paths to search for files.');

    return { files, bundle: {}, defaultBundle: {} };
  }

  if (uniqueIncludes.length === 0) {
    logger.warn('No includes patterns specified.');

    return { files, bundle: {}, defaultBundle: {} };
  }

  let allLanguages: Set<string> = new Set();
  let appResourceBundle: Resource = {};

  for (const directory of directories) {
    const languages = enumerateLanguages(directory);
    allLanguages = new Set([...allLanguages, ...languages]);

    for (const language of languages) {
      const resourceBundle: Resource = {};
      resourceBundle[language] = {};

      const languageDirectory = path.join(directory, language);
      const resourceFiles = findAllFiles(uniqueIncludes, languageDirectory);

      for (const file of resourceFiles) {
        const fullPath = path.resolve(directory, language, file);
        const extension = path.extname(file);

        if (!allowedExtensions.includes(extension)) {
          logger.warn(`Unsupported file: ${file}`);
          continue;
        }

        files.push(fullPath);

        const fileContent = fs.readFileSync(fullPath, 'utf8');

        const content =
          extension === '.json'
            ? JSON.parse(String(fileContent))
            : YAML.parse(String(fileContent));

        if (options.namespaceResolution) {
          let namespaceFilePath = file;

          if (options.namespaceResolution === 'basename') {
            namespaceFilePath = path.basename(file);
          } else if (options.namespaceResolution === 'relativePath') {
            namespaceFilePath = path.relative(
              path.join(directory, language),
              file
            );
          }

          const nsparts = namespaceFilePath
            .replace(extension, '')
            .split(path.sep)
            .filter((part) => part !== '' && part !== '..');

          const namespace = [language].concat(nsparts).join('.');

          prop.setProperty(resourceBundle, namespace, content);
        } else {
          resourceBundle[language] = content;
        }

        appResourceBundle = deep.merge(appResourceBundle, resourceBundle);
      }
    }
  }

  const defaultBundle = appResourceBundle[options.defaultLocale || 'en'];

  return { files, bundle: appResourceBundle, defaultBundle };
};
