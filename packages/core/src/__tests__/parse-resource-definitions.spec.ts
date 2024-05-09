import { describe, it, expect, vi } from 'vitest';
import { parseResourceFiles } from '../parse-resource-file';
import { IncludePattern } from '../types';

describe('parseResourceFiles', () => {
  it.each([undefined, 'basename', 'relativePath'] as (
    | undefined
    | 'basename'
    | 'relativePath'
  )[])(
    'should parse all resource files with %s ns resolution',
    (namespaceResolution) => {
      const logger = {
        warn: vi.fn(),
        error: vi.fn(),
        info: vi.fn(),
      };

      const { files, defaultBundle, bundle } = parseResourceFiles(
        {
          paths: ['./src/__tests__/__fixtures__/locales'],
          namespaceResolution: namespaceResolution,
        },
        logger
      );

      expect(bundle).toMatchSnapshot();
      expect(defaultBundle).toMatchSnapshot();
      expect(files).toHaveLength(3);
    }
  );

  it.each<IncludePattern>(['**/*.json', '**/*.yaml', '**/*.yml'])(
    'should parse resource files for pattern %s',
    (pattern) => {
      const logger = {
        warn: vi.fn(),
        error: vi.fn(),
        info: vi.fn(),
      };

      const { files, defaultBundle, bundle } = parseResourceFiles(
        {
          paths: ['./src/__tests__/__fixtures__/locales'],
          namespaceResolution: 'basename',
          include: [pattern],
        },
        logger
      );

      expect(bundle).toMatchSnapshot();
      expect(defaultBundle).toMatchSnapshot();
      expect(files).toHaveLength(1);
    }
  );

  it('calls logger.warn when no paths are included', () => {
    const logger = {
      warn: vi.fn(),
      error: vi.fn(),
      info: vi.fn(),
    };

    const { files, defaultBundle, bundle } = parseResourceFiles(
      {
        paths: [],
        namespaceResolution: 'basename',
      },
      logger
    );

    expect(logger.warn).toHaveBeenCalledWith('No paths to search for files.');
    expect(files).toHaveLength(0);
    expect(bundle).toEqual({});
    expect(defaultBundle).toEqual({});
  });

  it('calls logger.warn when no includes are specified', () => {
    const logger = {
      warn: vi.fn(),
      error: vi.fn(),
      info: vi.fn(),
    };

    const { files, defaultBundle, bundle } = parseResourceFiles(
      {
        paths: ['./src/__tests__/__fixtures__/locales'],
        namespaceResolution: 'basename',
        include: [],
      },
      logger
    );

    expect(logger.warn).toHaveBeenCalledWith('No includes patterns specified.');
    expect(files).toHaveLength(0);
    expect(bundle).toEqual({});
    expect(defaultBundle).toEqual({});
  });
});
