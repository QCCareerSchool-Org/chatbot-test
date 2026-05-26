import type { Config as SwcConfig } from '@swc/core';
import type { Config as JestConfig } from 'jest';

const swcConfig: SwcConfig = {
  jsc: {
    parser: { syntax: 'typescript' },
    target: 'esnext',
  },
  sourceMaps: 'inline',
};

const config: JestConfig = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.[cm]?[jt]sx?$': [ '@swc/jest', swcConfig ],
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(@openai|@modelcontextprotocol|zod|@faker-js/faker)/)',
  ],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.(js|mjs|cjs)$': '$1',
  },
  setupFiles: [
    '<rootDir>/jest.env.ts',
  ],
  collectCoverage: true,
  clearMocks: true,
};

export default config;
