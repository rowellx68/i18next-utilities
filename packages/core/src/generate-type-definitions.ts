import { flatten } from 'flat';
import type { ResourceLanguage } from 'i18next';
import type { I18NextTypedOptions, I18NextTypedDtsOptions } from './types';

const pluralSuffixes = ['_zero', '_one', '_two', '_few', '_many', '_other'];
const ordinalSuffixes = [
  '_ordinal_zero',
  '_ordinal_one',
  '_ordinal_two',
  '_ordinal_few',
  '_ordinal_many',
  '_ordinal_other',
];

export const generateModuleTypeDefinition = (
  moduleName: string,
  languages: string[]
): string => {
  const definition = `import { CustomTypeOptions } from 'i18next'

declare module '${moduleName}' {
  const resources: {
    ${languages.map((lang) => `'${lang}': CustomTypeOptions['resources']`).join('\n    ')}
  }

  export default resources
}
`;

  return definition;
};

export const generateResourceTypeDefinition = (
  resource: ResourceLanguage,
  options: Pick<I18NextTypedOptions, 'defaultNamespace' | 'dts'>
) => {
  const namespaces = Object.keys(resource);

  const defaultNS = options.defaultNamespace || 'translation';
  const { expand }: I18NextTypedDtsOptions = Object.assign(
    {
      expand: true,
    },
    options.dts || {}
  );

  const flatResources: Record<string, string[]> = {};

  for (const ns of namespaces) {
    const flattened = flatten(resource[ns], {
      safe: !expand,
    }) as object;
    const allKeys = Object.keys(flattened);

    const keysWithoutPluralsArrays = allKeys
      .filter((k) => expand || !ordinalSuffixes.some((s) => k.endsWith(s)))
      .filter((k) => expand || !pluralSuffixes.some((s) => k.endsWith(s)))
      .filter(
        (k) =>
          expand ||
          (!k.includes('_') &&
            !ordinalSuffixes.some((s) => k.endsWith(s)) &&
            !pluralSuffixes.some((s) => k.endsWith(s)))
      )
      .filter((k) => expand || !k.match(/\.\d+$/));

    const keysWithOrdinals = allKeys
      .filter((k) => ordinalSuffixes.some((s) => k.endsWith(s)))
      .map((k) => k.replace(/_ordinal_.+$/, ''));

    const keysWithPlurals = allKeys
      .filter((k) => !ordinalSuffixes.some((s) => k.endsWith(s)))
      .filter((k) => pluralSuffixes.some((s) => k.endsWith(s)))
      .map((k) => k.replace(/_zero|_one|_two|_few|_many|_other$/, ''))
      .map((k) => k.replace(/_.*$/, ''));

    const keysWithArrays = allKeys
      .filter((k) => k.match(/\.\d+$/))
      .map((k) => k.replace(/\.\d+$/, ''));

    const keysWithContexts = allKeys
      .filter((k) => k.includes('_'))
      .map((k) => k.replace(/_.*$/, ''));

    const keys = keysWithoutPluralsArrays
      .concat(
        keysWithOrdinals,
        keysWithPlurals,
        keysWithArrays,
        keysWithContexts
      )
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

    flatResources[ns] = Array.from(new Set(keys));
  }

  const definition = `import 'i18next'

type GeneratedResources = {
  ${namespaces
    .map(
      (ns) => `'${ns}': {
    ${flatResources[ns].map((key) => `'${key}': string`).join('\n    ')}
  }`
    )
    .join('\n  ')}
}

type FlatGeneratedResources<TResource, NS extends keyof TResource> = {
  [Property in keyof TResource[NS] as \`\${NS & string}:\${Property & string}\`]: TResource[NS][Property]
}

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: '${defaultNS}'
    resources: GeneratedResources
      ${namespaces
        .map(
          (ns) =>
            `& { '${defaultNS}': FlatGeneratedResources<GeneratedResources, '${ns}'> }`
        )
        .join('\n      ')}
  }
}
`;

  return definition;
};
