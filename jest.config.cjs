module.exports = {
  coverageDirectory: "<rootDir>/test-reports/coverage",
  collectCoverage: true,
  collectCoverageFrom: [
    "./lib/src/**",
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

  roots: [
    "./test/spec"
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