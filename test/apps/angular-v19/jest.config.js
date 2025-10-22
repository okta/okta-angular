module.exports = {
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  // globalSetup: 'jest-preset-angular/global-setup',
  // transformIgnorePatterns: [
  //   'node_modules/(?!.*.mjs$|rxjs|@okta/okta-auth-js|jsonpath-plus|@okta/okta-angular)'
  // ],
  testMatch: [
    '**/*.spec.ts'
  ],
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/dist/'
  ]
};
