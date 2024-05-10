import { IncludePattern } from 'i18next-utilities-core';

export type Options = {
  /**
   * Glob pattern to include files for bundling. Defaults to `['**\/*.json', '**\/*.yml', '**\/*.yaml']`.
   */
  include?: IncludePattern[];

  /**
   * Namespace resolution strategy. Defaults to `'none'`.
   */
  namespaceResolution?: 'basename' | 'relativePath';

  /**
   * Locale top-level directory paths. Ordered from least to most specific.
   */
  paths: string[];
};
