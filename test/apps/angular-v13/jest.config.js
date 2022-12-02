export default {
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  globalSetup: 'jest-preset-angular/global-setup',
  transformIgnorePatterns: [
    'node_modules/(?!.*\\.mjs$|@okta|rxjs|jsonpath-plus)'
  ],
  testMatch: [
    '**/*.spec.{js,ts}'
  ],
};