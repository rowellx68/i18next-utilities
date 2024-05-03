"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var src_exports = {};
__export(src_exports, {
  default: () => src_default
});
module.exports = __toCommonJS(src_exports);
var import_node_fs = __toESM(require("node:fs"), 1);
var import_node_path = __toESM(require("node:path"), 1);
var import_yaml = __toESM(require("yaml"), 1);
var import_flat = require("flat");
var import_ts_deepmerge = require("ts-deepmerge");
var import_dot_prop = require("dot-prop");
var import_fast_glob = __toESM(require("fast-glob"), 1);
var import_vite = require("vite");
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
    if (!import_node_fs.default.existsSync(p)) {
      throw new Error(`Path does not exist: ${p}`);
    }
  }
};
const findAllFiles = (globs, cwd) => {
  const globArray = Array.isArray(globs) ? globs : [globs];
  return globArray.map((g) => import_fast_glob.default.globSync(g, { cwd })).reduce((acc, val) => acc.concat(val), []);
};
const enumerateLanguages = (directory) => import_node_fs.default.readdirSync(directory).filter((f) => import_node_fs.default.statSync(import_node_path.default.join(directory, f)).isDirectory());
const resolvePaths = (paths, cwd) => paths.map((p) => import_node_path.default.isAbsolute(p) ? p : import_node_path.default.resolve(cwd, p));
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
      const languageDirectory = import_node_path.default.join(directory, language);
      const files = findAllFiles(uniqueIncludes, languageDirectory);
      for (const file of files) {
        const fullPath = import_node_path.default.resolve(directory, language, file);
        const extension = import_node_path.default.extname(file);
        if (!allowedExtensions.includes(extension)) {
          logger.warn(`Unsupported file: ${file}`);
          continue;
        }
        watchedFiles.push(fullPath);
        const fileContent = import_node_fs.default.readFileSync(fullPath, "utf8");
        const content = extension === ".json" ? JSON.parse(String(fileContent)) : import_yaml.default.parse(String(fileContent));
        if (options.namespaceResolution) {
          let namespaceFilePath = file;
          if (options.namespaceResolution === "basename") {
            namespaceFilePath = import_node_path.default.basename(file);
          } else if (options.namespaceResolution === "relativePath") {
            namespaceFilePath = import_node_path.default.relative(
              import_node_path.default.join(directory, language),
              file
            );
          }
          const nsparts = namespaceFilePath.replace(extension, "").split(import_node_path.default.sep).filter((part) => part !== "" && part !== "..");
          const namespace = [language].concat(nsparts).join(".");
          (0, import_dot_prop.setProperty)(resourceBundle, namespace, content);
        } else {
          resourceBundle[language] = content;
        }
        appResourceBundle = (0, import_ts_deepmerge.merge)(appResourceBundle, resourceBundle);
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
    const flattened = (0, import_flat.flatten)(resource[ns]);
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
  import_node_fs.default.writeFile(options.output || "./src/types/i18next.d.ts", definition, "utf-8", (err) => {
  });
};
const factory = (options) => {
  let _watchedFiles = [];
  let _bundle = {};
  let _defaultBundle = {};
  const logger = (0, import_vite.createLogger)(options.logLevel ?? "warn", { prefix: "[typed-i18next-loader]" });
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
      const module2 = server.moduleGraph.getModuleById(resolvedVirtualModuleId);
      if (module2) {
        server.moduleGraph.invalidateModule(module2);
      }
    }
  };
  return plugin;
};
var src_default = factory;
//# sourceMappingURL=index.cjs.map