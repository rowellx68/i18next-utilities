import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';
import { flatten } from 'flat';
import { merge } from 'ts-deepmerge';
import { setProperty } from 'dot-prop';
import fast from 'fast-glob';
import { createLogger, Plugin, Logger } from 'vite';
import {
  I18NextTypedDtsOptions,
  I18NextTypedLoaderOptions,
  IncludePattern,
  ResourceBundle,
} from './types';

export type { I18NextTypedLoaderOptions };

const virtualModuleId = 'virtual:i18next-typed-loader';
const resolvedVirtualModuleId = '\0' + virtualModuleId;

const defaultIncludes: IncludePattern[] = [
  '**/*.json',
  '**/*.yml',
  '**/*.yaml',
];

const allowedExtensions = ['.json', '.yml', '.yaml'];

const pluralSuffixes = ['_zero', '_one', '_two', '_few', '_many', '_other'];
const ordinalSuffixes = [
  '_ordinal_one',
  '_ordinal_two',
  '_ordinal_few',
  '_ordinal_other',
];

const assertExistence = (paths: string[]): void => {
  for (const p of paths) {
    if (!fs.existsSync(p)) {
      throw new Error(`Path does not exist: ${p}`);
    }
  }
};

const findAllFiles = (globs: string | string[], cwd: string): string[] => {
  const globArray = Array.isArray(globs) ? globs : [globs];

  return globArray
    .map((g) => fast.globSync(g, { cwd }))
    .reduce((acc, val) => acc.concat(val), []);
};

const enumerateLanguages = (directory: string): string[] =>
  fs
    .readdirSync(directory)
    .filter((f) => fs.statSync(path.join(directory, f)).isDirectory());

const resolvePaths = (paths: string[], cwd: string): string[] =>
  paths.map((p) => (path.isAbsolute(p) ? p : path.resolve(cwd, p)));

const loadContent = (options: I18NextTypedLoaderOptions, logger: Logger) => {
  const directories = resolvePaths(options.paths, process.cwd());
  const watchedFiles: string[] = [];

  assertExistence(directories);

  const uniqueIncludes = Array.from(
    new Set(options.include ?? defaultIncludes),
  );

  if (options.paths.length === 0) {
    logger.warn('No paths to search for files.');
  }

  if (uniqueIncludes.length === 0) {
    logger.warn('No includes patterns specified.');
  }

  let allLanguages: Set<string> = new Set();
  let appResourceBundle: ResourceBundle = {};

  for (const directory of directories) {
    const languages = enumerateLanguages(directory);
    allLanguages = new Set([...allLanguages, ...languages]);

    for (const language of languages) {
      const resourceBundle: ResourceBundle = {};
      resourceBundle[language] = {};

      const languageDirectory = path.join(directory, language);
      const files = findAllFiles(uniqueIncludes, languageDirectory);

      for (const file of files) {
        const fullPath = path.resolve(directory, language, file);
        const extension = path.extname(file);

        if (!allowedExtensions.includes(extension)) {
          logger.warn(`Unsupported file: ${file}`);
          continue;
        }

        watchedFiles.push(fullPath);

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
              file,
            );
          }

          const nsparts = namespaceFilePath
            .replace(extension, '')
            .split(path.sep)
            .filter((part) => part !== '' && part !== '..');

          const namespace = [language].concat(nsparts).join('.');

          setProperty(resourceBundle, namespace, content);
        } else {
          resourceBundle[language] = content;
        }

        appResourceBundle = merge(appResourceBundle, resourceBundle);
      }
    }
  }

  const defaultBundle = appResourceBundle[
    options.defaultLocale || 'en'
  ] as Record<string, ResourceBundle>;

  return { watchedFiles, bundle: appResourceBundle, defaultBundle };
};

const generateResourceTypeDefinition = (
  resource: ResourceBundle,
  options: I18NextTypedLoaderOptions,
) => {
  const namespaces = Object.keys(resource);

  const defaultNS = options.defaultNamespace || 'translation';
  const dtsOptions: I18NextTypedDtsOptions = Object.assign(
    {
      expand: {
        arrays: false,
        ordinals: false,
        plurals: false,
      },
    },
    options.dts || {},
  );

  const flatResources: Record<string, string[]> = {};

  for (const ns of namespaces) {
    const flattened = flatten(resource[ns], {
      safe: !dtsOptions.expand.arrays,
    }) as object;
    const allKeys = Object.keys(flattened);

    const keysWithoutPluralsArrays = allKeys
      .filter(
        (k) =>
          dtsOptions.expand.ordinals ||
          !ordinalSuffixes.some((s) => k.endsWith(s)),
      )
      .filter(
        (k) =>
          dtsOptions.expand.plurals ||
          !pluralSuffixes.some((s) => k.endsWith(s)),
      )
      .filter((k) => dtsOptions.expand.arrays || !k.match(/\.\d+$/));

    const keysWithOrdinals = allKeys
      .filter((k) => ordinalSuffixes.some((s) => k.endsWith(s)))
      .map((k) => k.replace(/_ordinal_.+$/, ''));

    const keysWithPlurals = allKeys
      .filter((k) => !ordinalSuffixes.some((s) => k.endsWith(s)))
      .filter((k) => pluralSuffixes.some((s) => k.endsWith(s)))
      .map((k) => k.replace(/_zero|_one|_two|_few|_many|_other$/, ''));

    const keysWithArrays = allKeys
      .filter((k) => k.match(/\.\d+$/))
      .map((k) => k.replace(/\.\d+$/, ''));

    const keys = keysWithoutPluralsArrays.concat(
      keysWithOrdinals,
      keysWithPlurals,
      keysWithArrays,
    );

    flatResources[ns] = Array.from(new Set(keys));
  }

  const definition = `// WARNING: This file is auto-generated by vite-plugin-typed-i18next-loader. Do not edit it manually.

import 'i18next'

type GeneratedResources = {
  ${namespaces
    .map(
      (ns) => `'${ns}': {
    ${flatResources[ns].map((key) => `'${key}': string`).join('\n    ')}
  }`,
    )
    .join('\n  ')}
}

type FlatGeneratedResources<TResource, NS extends keyof TResource> = {
  [Property in keyof TResource[NS] as \`\${NS & string}:\${Property & string}\`]: TResource[NS][Property]
}

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: '${defaultNS}'
    resources: GeneratedResources
      ${namespaces
        .map(
          (ns) =>
            `& { '${defaultNS}': FlatGeneratedResources<GeneratedResources, '${ns}'> }`,
        )
        .join('\n      ')}
  }
}
`;

  fs.writeFile(
    options.dtsOutputFile || './src/types/i18next.d.ts',
    definition,
    'utf-8',
    (err) => {
      if (err) {
        throw err;
      }
    },
  );
};

const factory = (options: I18NextTypedLoaderOptions): Plugin => {
  let _watchedFiles: string[] = [];
  let _bundle: ResourceBundle = {};

  const logger = createLogger(options.logLevel ?? 'warn', {
    prefix: '[typed-i18next-loader]',
  });

  const plugin: Plugin = {
    name: 'vite-plugin-typed-i18next-loader',
    resolveId(id) {
      if (id === virtualModuleId) {
        const { watchedFiles, bundle, defaultBundle } = loadContent(
          options,
          logger,
        );

        _watchedFiles = watchedFiles;
        _bundle = bundle;

        generateResourceTypeDefinition(defaultBundle, options);

        logger.info(
          `Type definitions generated for default locale: ${options.defaultLocale || 'en'}`,
          { timestamp: true },
        );
        logger.info(
          `Definitions saved to: ${options.dtsOutputFile || './src/types/i18next.d.ts'}`,
          { timestamp: true },
        );

        return resolvedVirtualModuleId;
      }

      return null;
    },
    load(id) {
      if (id !== resolvedVirtualModuleId) {
        return null;
      }

      _watchedFiles.forEach((file) => this.addWatchFile(file));

      return `export default ${JSON.stringify(_bundle)}`;
    },
    handleHotUpdate({ server, file }) {
      if (!_watchedFiles.includes(file)) {
        return;
      }

      const { bundle, defaultBundle, watchedFiles } = loadContent(
        options,
        logger,
      );

      _watchedFiles = watchedFiles;
      _bundle = bundle;

      generateResourceTypeDefinition(defaultBundle, options);

      const module = server.moduleGraph.getModuleById(resolvedVirtualModuleId);

      if (module) {
        server.moduleGraph.invalidateModule(module);
      }
    },
  };

  return plugin;
};

export default factory;
