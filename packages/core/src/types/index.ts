export type IncludePattern = '**/*.json' | '**/*.yml' | '**/*.yaml';

export type I18NextTypedDtsOptions = {
  expand: boolean;
};

export type I18NextTypedOptions = {
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
   * Options for generating the type definitions.
   *
   * When set to `true`, the arrays/ordinals/plurals will be expanded.
   *
   * @default { expand: true }
   */
  dts?: I18NextTypedDtsOptions;
};

export type I18NextTypedLogger = {
  info: (message: string) => void;
  warn: (message: string) => void;
  error: (message: string) => void;
};
