import { createLogger, Plugin } from 'vite'
import { I18NextTypedLoaderOptions } from './types'
import { virtualModuleId, resolvedVirtualModuleId, loadContent, generateTypeDefinition } from './utilities'

export type { I18NextTypedLoaderOptions }

const factory = (options: I18NextTypedLoaderOptions): Plugin => {
  const logger = createLogger(options.logLevel ?? 'warn', { prefix: '[typed-i18next-loader]' })

  const plugin: Plugin = {
    name: 'vite-plugin-typed-i18next-loader',
    resolveId(id) {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId
      }

      return null
    },
    load(id) {
      if (id !== resolvedVirtualModuleId) {
        return null
      }

      const { watchedFiles, bundle } = loadContent(options, logger)
      watchedFiles.forEach(this.addWatchFile)
      generateTypeDefinition(bundle, options)

      return `export default ${JSON.stringify(bundle)}`
    },
    handleHotUpdate({ server }) {
      const module = server.moduleGraph.getModuleById(resolvedVirtualModuleId)

      if (module) {
        server.moduleGraph.invalidateModule(module)
      }
    },
  }

  return plugin
}

export default factory
