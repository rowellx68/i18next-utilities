import { describe, it, expect } from 'vitest';
import type { ResourceLanguage } from 'i18next';
import {
  generateResourceTypeDefinition,
  generateModuleTypeDefinition,
} from '../generate-type-definitions';
import type { I18NextTypedDtsOptions } from '../types';

const resources: ResourceLanguage = {
  translation: {
    'app.name': 'My App',
    'ordinal.rank_ordinal_zero': '{{count}}th',
    'ordinal.rank_ordinal_one': '{{count}}st',
    'ordinal.rank_ordinal_two': '{{count}}nd',
    'ordinal.rank_ordinal_few': '{{count}}rd',
    'ordinal.rank_ordinal_many': '{{count}}th',
    'ordinal.rank_ordinal_other': '{{count}}th',
    'plural.items_zero': '{{count}} items',
    'plural.items_one': '{{count}} item',
    'plural.items_two': '{{count}} items',
    'plural.items_few': '{{count}} items',
    'plural.items_many': '{{count}} items',
    'plural.items_other': '{{count}} items',
    'books.pagination_interval': '(0) books;(2-Inf);',
    'array.0': 'lorem',
    'array.1': 'ipsum',
    'array.2': 'dolor',
  },
};

describe('generateResourceTypeDefinition', () => {
  it('should generate the correct type definition', () => {
    const result = generateResourceTypeDefinition(resources, {
      defaultNamespace: 'translation',
    });

    expect(result).toMatchSnapshot();
  });

  it.each<I18NextTypedDtsOptions['expand']>([true, false])(
    `should generate the correct type definition when expand is %o`,
    (expand) => {
      const result = generateResourceTypeDefinition(resources, {
        defaultNamespace: 'translation',
        dts: { expand },
      });

      expect(result).toMatchSnapshot();
    }
  );
});

describe('generateModuleTypeDefinition', () => {
  it('should generate the correct type definition', () => {
    const result = generateModuleTypeDefinition(
      'virtual:i18next-typed-loader',
      ['en', 'es', 'en-GB']
    );

    expect(result).toMatchSnapshot();
  });
});
