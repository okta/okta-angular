module.exports = {
  coverageDirectory: "<rootDir>/test-reports/coverage",
  collectCoverage: true,
  collectCoverageFrom: [
    "./src/**",
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
    '^.+\\.(ts|html)$': "ts-jest"
  },
  transformIgnorePatterns: [
    "node_modules",
    "packages/(?!okta-angular)"
  ],
  globals: {
    'ts-jest': {
      tsconfig: "<rootDir>/test/spec/tsconfig.spec.json"
    }
  },
  preset: "jest-preset-angular",
  roots: [
    "./test/spec"
  ],
  setupFilesAfterEnv: [
    "<rootDir>/test/support/setupJest.ts"
  ]
}