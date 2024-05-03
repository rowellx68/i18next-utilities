import fs from "node:fs";
import path from "node:path";
import YAML from "yaml";
import { flatten } from "flat";
import { merge } from "ts-deepmerge";
import { setProperty } from "dot-prop";
import { globSync } from "fast-glob";
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
  return globArray.map((g) => globSync(g, { cwd })).reduce((acc, val) => acc.concat(val), []);
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
        watchedFiles.push(file);
        const fullPath = path.resolve(directory, language, file);
        const extension = path.extname(file);
        if (!allowedExtensions.includes(extension)) {
          logger.warn(`Unsupported file: ${file}`);
          continue;
        }
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
  const defaultResourceKeys = [];
  const resourcesKeys = [];
  if (defaultNS) {
    const flattened = flatten(resource[defaultNS]);
    defaultResourceKeys.push(...Object.keys(flattened));
  }
  for (const ns of namespaces) {
    const flattened = flatten(resource[ns]);
    const keys = Object.keys(flattened).map((key) => `${ns}:${key}`);
    resourcesKeys.push(...keys);
  }
  const definition = `import 'i18next'

type GeneratedDefaultResource = {
  ${defaultResourceKeys.map((key) => `'${key}': string`).join("\n")}
}

type GeneratedResources = {
  ${resourcesKeys.map((key) => `'${key}': string`).join("\n")}
}

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: GeneratedDefaultResource
    resources: GeneratedResources
  }
}
`;
  fs.writeFile(options.output || "./types/i18next.d.ts", definition, "utf-8", (err) => {
  });
};
const factory = (options) => {
  const logger = createLogger(options.logLevel ?? "warn", { prefix: "[typed-i18next-loader]" });
  const plugin = {
    name: "vite-plugin-typed-i18next-loader",
    resolveId(id) {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId;
      }
      return null;
    },
    load(id) {
      if (id !== resolvedVirtualModuleId) {
        return null;
      }
      const { watchedFiles, bundle, defaultBundle } = loadContent(options, logger);
      watchedFiles.forEach(this.addWatchFile);
      generateTypeDefinition(defaultBundle, options);
      return `export default ${JSON.stringify(bundle)}`;
    },
    handleHotUpdate({ server }) {
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