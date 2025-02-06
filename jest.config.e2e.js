const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  testEnvironment: 'node',
  testMatch: ['**/e2e/api/**/*.test.ts'],
  setupFilesAfterEnv: ['<rootDir>/e2e/setup.ts'],
};

module.exports = createJestConfig(customJestConfig); 