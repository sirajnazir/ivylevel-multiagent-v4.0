module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/packages'],
  testMatch: ['**/*.test.ts'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  collectCoverageFrom: [
    'packages/**/*.ts',
    '!packages/**/*.test.ts',
    '!packages/**/*.d.ts',
  ],
  coverageDirectory: 'coverage',
  verbose: true,
};
