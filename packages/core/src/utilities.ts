import fs from 'fs';
import path from 'path';
import fast from 'fast-glob';

export const assertExistence = (paths: string[]): void => {
  for (const p of paths) {
    if (!fs.existsSync(p)) {
      throw new Error(`Path does not exist: ${p}`);
    }
  }
};

export const findAllFiles = (
  globs: string | string[],
  cwd: string
): string[] => {
  const globArray = Array.isArray(globs) ? globs : [globs];

  return globArray
    .map((g) => fast.globSync(g, { cwd }))
    .reduce((acc, val) => acc.concat(val), []);
};

export const enumerateLanguages = (directory: string): string[] =>
  fs
    .readdirSync(directory)
    .filter((f) => fs.statSync(path.join(directory, f)).isDirectory());

export const resolvePaths = (paths: string[], cwd: string): string[] =>
  paths.map((p) => (path.isAbsolute(p) ? p : path.resolve(cwd, p)));
