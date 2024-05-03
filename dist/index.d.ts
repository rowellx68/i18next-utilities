import { LogLevel, Plugin } from 'vite';

type IncludePattern = '**/*.json' | '**/*.yml' | '**/*.yaml';
type I18NextTypedLoaderOptions = {
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
     * Output directory for the generated types.
     * @default './src/types/i18next.d.ts'
     */
    output?: string;
};

declare const factory: (options: I18NextTypedLoaderOptions) => Plugin;

export { type I18NextTypedLoaderOptions, factory as default };
