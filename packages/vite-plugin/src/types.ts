import type { I18NextTypedOptions } from 'i18next-utilities-core';
import type { LogLevel } from 'vite';

export type I18NextTypedLoaderOptions = {
  /**
   * Log level.
   * @default 'warn'
   */
  logLevel?: LogLevel;

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
} & I18NextTypedOptions;
