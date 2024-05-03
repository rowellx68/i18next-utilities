import fs from 'node:fs'
import path from 'node:path'
import YAML from 'yaml'
import { flatten } from 'flat'
import { merge } from 'ts-deepmerge'
import { setProperty } from 'dot-prop'
import { globSync } from 'fast-glob'
import { I18NextTypedLoaderOptions, IncludePattern, ResourceBundle } from './types'
import { Logger } from 'vite'

export const virtualModuleId = 'virtual:i18next-typed-loader'
export const resolvedVirtualModuleId = '\0' + virtualModuleId

const defaultIncludes: IncludePattern[] = [
  '**/*.json',
  '**/*.yml',
  '**/*.yaml',
]

const allowedExtensions = ['.json', '.yml', '.yaml']

const assertExistence = (paths: string[]): void => {
  for (const p of paths) {
    if (!fs.existsSync(p)) {
      throw new Error(`Path does not exist: ${p}`)
    }
  }
}

const findAllFiles = (globs: string | string[], cwd: string): string[] => {
  const globArray = Array.isArray(globs) ? globs : [globs]

  return globArray
    .map((g) => globSync(g, { cwd }))
    .reduce((acc, val) => acc.concat(val), [])
}

const enumerateLanguages = (directory: string): string[] =>
  fs
    .readdirSync(directory)
    .filter((f) => fs.statSync(path.join(directory, f)).isDirectory())

const resolvePaths = (paths: string[], cwd: string): string[] =>
  paths.map((p) => (path.isAbsolute(p) ? p : path.resolve(cwd, p)))

export const loadContent = (options: I18NextTypedLoaderOptions, logger: Logger) => {
  const directories = resolvePaths(options.paths, process.cwd())
  const watchedFiles: string[] = []

  assertExistence(directories)

  const uniqueIncludes = Array.from(
    new Set(options.include ?? defaultIncludes)
  )

  if (options.paths.length === 0) {
    logger.warn('No paths to search for files.')
  }

  if (uniqueIncludes.length === 0) {
    logger.warn('No includes patterns specified.')
  }

  let allLanguages: Set<string> = new Set()
  let appResourceBundle: ResourceBundle = {}

  for (const directory of directories) {
    const languages = enumerateLanguages(directory)
    allLanguages = new Set([...allLanguages, ...languages])

    for (const language of languages) {
      const resourceBundle: ResourceBundle = {}
      resourceBundle[language] = {}

      const languageDirectory = path.join(directory, language)
      const files = findAllFiles(uniqueIncludes, languageDirectory)

      for (const file of files) {
        watchedFiles.push(file)

        const fullPath = path.resolve(directory, language, file)
        const extension = path.extname(file)

        if (!allowedExtensions.includes(extension)) {
          logger.warn(`Unsupported file: ${file}`)
          continue
        }

        const fileContent = fs.readFileSync(fullPath, 'utf8')

        const content =
          extension === '.json'
            ? JSON.parse(String(fileContent))
            : YAML.parse(String(fileContent))

        if (options.namespaceResolution) {
          let namespaceFilePath = file

          if (options.namespaceResolution === 'basename') {
            namespaceFilePath = path.basename(file)
          } else if (options.namespaceResolution === 'relativePath') {
            namespaceFilePath = path.relative(
              path.join(directory, language),
              file
            )
          }

          const nsparts = namespaceFilePath
              .replace(extension, '')
              .split(path.sep)
              .filter((part) => part !== '' && part !== '..')

          const namespace = [language].concat(nsparts).join('.')

          setProperty(resourceBundle, namespace, content)
        } else {
          resourceBundle[language] = content
        }

        appResourceBundle = merge(appResourceBundle, resourceBundle)
      }
    }
  }

  return { watchedFiles, bundle: appResourceBundle }
};

export const generateTypeDefinition = (resource: ResourceBundle, options: I18NextTypedLoaderOptions) => {
  const namespaces = Object.keys(resource)

  const defaultNS = namespaces.find((ns) => ns === options.defaultNamespace || 'translation')

  const defaultResourceKeys: string[] = []
  const resourcesKeys: string[] = []

  if (defaultNS) {
    const flattened = flatten(resource[defaultNS]) as object
    defaultResourceKeys.push(...Object.keys(flattened))
  }

  for (const ns of namespaces) {
    const flattened = flatten(resource[ns]) as object
    const keys = Object.keys(flattened).map((key) => `${ns}:${key}`)
    resourcesKeys.push(...keys)
  }

  const definition = `import 'i18next'

type GeneratedDefaultResource = {
  ${defaultResourceKeys.map((key) => `'${key}': string`).join('\n')}
}

type GeneratedResources = {
  ${resourcesKeys.map((key) => `'${key}': string`).join('\n')}
}

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: GeneratedDefaultResource
    resources: GeneratedResources
  }
}
`;

    fs.writeFile(options.output || './types/i18next.d.ts', definition, 'utf-8', (err) => {});
}
