module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/packages', '<rootDir>/tools', '<rootDir>/scripts'],
  testMatch: ['**/*.test.ts'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  collectCoverageFrom: [
    'packages/**/*.ts',
    'tools/**/*.ts',
    '!packages/**/*.test.ts',
    '!tools/**/*.test.ts',
    '!packages/**/*.d.ts',
    '!tools/**/*.d.ts',
  ],
  coverageDirectory: 'coverage',
  verbose: true,
  // Transform ES modules from node_modules
  transformIgnorePatterns: [
    'node_modules/(?!(p-limit|yocto-queue|chalk|ora|uuid)/)'
  ],
};
