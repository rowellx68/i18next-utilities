import type { LogLevel } from 'vite';

export type IncludePattern = '**/*.json' | '**/*.yml' | '**/*.yaml';

export type I18NextTypedDtsOptions = {
  expand: {
    arrays: boolean;
    contexts: boolean;
    ordinals: boolean;
    plurals: boolean;
  };
};

export type I18NextTypedLoaderOptions = {
  /**
   * Log level.
   * @default 'warn'
   */
  logLevel?: LogLevel;

  /**
   * Glob pattern to include files for bundling.
   * @default ['**\/*.json', '**\/*.yml', '**\/*.yaml']
   */
  include?: IncludePattern[];

  /**
   * Namespace resolution strategy.
   */
  namespaceResolution?: 'basename' | 'relativePath';

  /**
   * Default namespace for files that do not have a namespace specified.
   * @default 'translation'
   */
  defaultNamespace?: string;

  /**
   * Default locale which will be used to generate the types.
   * @default 'en'
   */
  defaultLocale?: string;

  /**
   * Locale top-level directory paths. Ordered from least to most specific.
   */
  paths: string[];

  /**
   * Output file destination for the generated types.
   * @default './src/types/i18next.d.ts'
   */
  dtsOutputFile?: string;

  /**
   * Output file destination for the generated virtual module types.
   * @default './src/types/i18next-virtual.d.ts'
   */
  virtualModuleDtsOutputFile?: string;

  /**
   * Options for generating the type definitions.
   *
   * When set to `true`, the arrays/ordinals/plurals will be expanded.
   *
   * @default { expand: { arrays: false, ordinals: false, plurals: false } }
   */
  dts?: I18NextTypedDtsOptions;
};
