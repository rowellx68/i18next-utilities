import fs from "node:fs";
import path from "node:path";
import YAML from "yaml";
import { flatten } from "flat";
import { merge } from "ts-deepmerge";
import { setProperty } from "dot-prop";
import fast from "fast-glob";
import { createLogger } from "vite";
const virtualModuleId = "virtual:i18next-typed-loader";
const resolvedVirtualModuleId = "\0" + virtualModuleId;
const defaultIncludes = [
  "**/*.json",
  "**/*.yml",
  "**/*.yaml"
];
const allowedExtensions = [".json", ".yml", ".yaml"];
const assertExistence = (paths) => {
  for (const p of paths) {
    if (!fs.existsSync(p)) {
      throw new Error(`Path does not exist: ${p}`);
    }
  }
};
const findAllFiles = (globs, cwd) => {
  const globArray = Array.isArray(globs) ? globs : [globs];
  return globArray.map((g) => fast.globSync(g, { cwd })).reduce((acc, val) => acc.concat(val), []);
};
const enumerateLanguages = (directory) => fs.readdirSync(directory).filter((f) => fs.statSync(path.join(directory, f)).isDirectory());
const resolvePaths = (paths, cwd) => paths.map((p) => path.isAbsolute(p) ? p : path.resolve(cwd, p));
const loadContent = (options, logger) => {
  const directories = resolvePaths(options.paths, process.cwd());
  const watchedFiles = [];
  assertExistence(directories);
  const uniqueIncludes = Array.from(
    new Set(options.include ?? defaultIncludes)
  );
  if (options.paths.length === 0) {
    logger.warn("No paths to search for files.");
  }
  if (uniqueIncludes.length === 0) {
    logger.warn("No includes patterns specified.");
  }
  let allLanguages = /* @__PURE__ */ new Set();
  let appResourceBundle = {};
  for (const directory of directories) {
    const languages = enumerateLanguages(directory);
    allLanguages = /* @__PURE__ */ new Set([...allLanguages, ...languages]);
    for (const language of languages) {
      const resourceBundle = {};
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
        const fileContent = fs.readFileSync(fullPath, "utf8");
        const content = extension === ".json" ? JSON.parse(String(fileContent)) : YAML.parse(String(fileContent));
        if (options.namespaceResolution) {
          let namespaceFilePath = file;
          if (options.namespaceResolution === "basename") {
            namespaceFilePath = path.basename(file);
          } else if (options.namespaceResolution === "relativePath") {
            namespaceFilePath = path.relative(
              path.join(directory, language),
              file
            );
          }
          const nsparts = namespaceFilePath.replace(extension, "").split(path.sep).filter((part) => part !== "" && part !== "..");
          const namespace = [language].concat(nsparts).join(".");
          setProperty(resourceBundle, namespace, content);
        } else {
          resourceBundle[language] = content;
        }
        appResourceBundle = merge(appResourceBundle, resourceBundle);
      }
    }
  }
  const defaultBundle = appResourceBundle[options.defaultLocale || "en"];
  return { watchedFiles, bundle: appResourceBundle, defaultBundle };
};
const generateTypeDefinition = (resource, options) => {
  const namespaces = Object.keys(resource);
  const defaultNS = namespaces.find((ns) => ns === options.defaultNamespace || "translation");
  const resourcesKeys = {};
  for (const ns of namespaces) {
    const flattened = flatten(resource[ns]);
    const keys = Object.keys(flattened);
    resourcesKeys[ns] = keys;
    if (defaultNS) {
      resourcesKeys[defaultNS] = [...resourcesKeys[defaultNS], ...keys.map((key) => `${ns}:${key}`)];
    }
  }
  const definition = `import 'i18next'

  type GeneratedResources = {
    ${Object.keys(resourcesKeys).map((ns) => `'${ns}': {
      ${resourcesKeys[ns].map((key) => `'${key}': string`).join("\n      ")}
    }`).join("\n    ")}
  }

  declare module 'i18next' {
    interface CustomTypeOptions {
      defaultNS: '${defaultNS}'
      resources: GeneratedResources
    }
  }
`;
  fs.writeFile(options.output || "./src/types/i18next.d.ts", definition, "utf-8", (err) => {
  });
};
const factory = (options) => {
  let _watchedFiles = [];
  let _bundle = {};
  let _defaultBundle = {};
  const logger = createLogger(options.logLevel ?? "warn", { prefix: "[typed-i18next-loader]" });
  const plugin = {
    name: "vite-plugin-typed-i18next-loader",
    resolveId(id) {
      if (id === virtualModuleId) {
        const { watchedFiles, bundle, defaultBundle } = loadContent(options, logger);
        generateTypeDefinition(defaultBundle, options);
        _watchedFiles = watchedFiles;
        _bundle = bundle;
        _defaultBundle = defaultBundle;
        logger.info(`Type definitions generated for default locale: ${options.defaultLocale || "en"}`, { timestamp: true });
        logger.info(`Definitions saved to: ${options.output || "./src/types/i18next.d.ts"}`, { timestamp: true });
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
    handleHotUpdate({ server, file, timestamp }) {
      if (!_watchedFiles.includes(file)) {
        return;
      }
      const { bundle, defaultBundle, watchedFiles } = loadContent(options, logger);
      generateTypeDefinition(defaultBundle, options);
      _bundle = bundle;
      _defaultBundle = defaultBundle;
      _watchedFiles = watchedFiles;
      const module = server.moduleGraph.getModuleById(resolvedVirtualModuleId);
      if (module) {
        server.moduleGraph.invalidateModule(module);
      }
    }
  };
  return plugin;
};
var src_default = factory;
export {
  src_default as default
};
//# sourceMappingURL=index.js.map