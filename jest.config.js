export default {
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
  transform: {
     "^.+\\.(ts|html)$": "jest-preset-angular"
  },
  transformIgnorePatterns: [
    "node_modules"
  ],
  preset: "jest-preset-angular",
  roots: [
    "./test/spec"
  ],
  testMatch: [
    "<rootDir>/test/spec/*.ts"
  ],
  globalSetup: "jest-preset-angular/global-setup"
};