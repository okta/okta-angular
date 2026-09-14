module.exports = {
  coverageDirectory: "<rootDir>/test-reports/coverage",
  collectCoverage: true,
  collectCoverageFrom: [
    "./lib/src/**",
    "./lib/client-js/src/**",
    "!./test/**"
  ],
  reporters: [
    "default",
    [ "jest-junit", {
      "outputDirectory": "./test-reports/unit/",
      "outputName": "junit-result.xml"
    }]
  ],
  restoreMocks: true,

  moduleNameMapper: {
    // `@okta/spa-platform` is ESM-only and node_modules is not transformed, so requiring the real
    // package from a spec throws ERR_REQUIRE_ESM. lib/client-js/ imports exactly two values from it
    // (`addEnv` and `FetchClient`); the stub provides both.
    "^@okta/spa-platform$": "<rootDir>/test/mocks/spa-platform.ts"
  },

  roots: [
    "./test/spec",
    "./test/mocks"
  ],
  testMatch: [
    "<rootDir>/test/spec/*.ts"
  ],
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/dist/',
    '<rootDir>/test/apps/*'
  ],
};