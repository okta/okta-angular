export default {
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  globalSetup: 'jest-preset-angular/global-setup',
  transform: {
    //'^.+\\.(ts|js)$': 'jest-preset-angular'
  },
  transformIgnorePatterns: [
    //'node_modules/(?!@angular|@okta|rxjs|jsonpath-plus)'
  ],
  testMatch: [
    '**/*.spec.{js,ts}'
  ],
};