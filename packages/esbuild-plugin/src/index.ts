import type { PartialMessage, Plugin } from 'esbuild';
import { parseResourceFiles } from 'i18next-utilities-core';
import { name as pluginName } from '../package.json';
import type { Options } from './types';

export const i18nextPlugin = (options: Options): Plugin => {
  return {
    name: pluginName,
    setup(build) {
      build.onResolve({ filter: /^virtual:i18next-loader$/ }, () => {
        return { path: 'localizations', namespace: 'i18next' };
      });

      build.onLoad({ filter: /^localizations$/, namespace: 'i18next' }, () => {
        const warnings: PartialMessage[] = [];
        const errors: PartialMessage[] = [];

        const logger = {
          warn: (message: string) => {
            warnings.push({
              pluginName,
              text: message,
            });
          },
          error: (message: string) => {
            errors.push({
              pluginName,
              text: message,
            });
          },
          info: () => {},
        };

        const { bundle, files } = parseResourceFiles(options, logger);
        return {
          contents: `export default ${JSON.stringify(bundle)}`,
          warnings,
          errors,
          watchFiles: files,
          loader: 'js',
        };
      });
    },
  };
};
