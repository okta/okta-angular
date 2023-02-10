// https://eslint.org/docs/user-guide/configuring

const packageJson = require('./package.json');
const devDependencies = Object.keys(packageJson.devDependencies || {});

module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:node/recommended-script'
  ],
  plugins: [
    'node',
    '@typescript-eslint',
    'import',
  ],
  rules: {
    'semi': ['error', 'always'],
    'node/no-unsupported-features/es-syntax': 0,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 2020,
    project: 'tsconfig.json'
  },
  settings: {
    node: {
      tryExtensions: ['.js', '.ts']
    },
    // https://github.com/import-js/eslint-plugin-import#typescript
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts']
    },
    'import/resolver': {
      'typescript': true,
      'node': true
    },
  },
  overrides: [
    {
      // ES6/browser processed by Babel
      files: [
        'lib/src/**/*',
        'test/spec/**/*',
        'test/e2e/harness/src/**/*',
        'test/e2e/harness/e2e/**/*'
      ],
      env: {
        browser: true,
        es6: true,
        node: false
      },
      rules: {
        'node/no-unsupported-features/node-builtins': 0,
        'node/no-unpublished-import': ['error', {
          'allowModules': devDependencies
        }],
        // To allow @okta/okta-auth-js/*
        'node/no-missing-import': ['error', {
          'allowModules': [
            '@okta/okta-auth-js'
          ]
        }],
      }
    },
    // Angular 12-15 test apps
    {
      files: ['test/apps/**/*'],
      extends: [
        'plugin:import/recommended',
        'plugin:@typescript-eslint/recommended'
      ],
      rules: {
        'node/no-extraneous-import': ['error', {
          'allowModules': [
            '@okta/okta-angular'
          ]
        }],
        'node/no-missing-import': ['error', {
          'allowModules': [
            '@okta/okta-angular'
          ]
        }],
        'import/no-unresolved': ['error', {
          ignore: [
            'environments/environment'
          ]
        }]
      }
    },
    // Selenium test
    {
      files: ['test/selenium-test/**/*', 'test/support/**/*'],
      extends: [
        'plugin:@typescript-eslint/recommended'
      ],
      rules: {
        'node/no-missing-import': ['error', {
          'allowModules': [
            '@okta/okta-angular',
            '@okta/okta-signin-widget'
          ]
        }],
        'node/no-unpublished-import': ['error', {
          'allowModules': devDependencies
        }],
      }
    },
    // NodeJS build tools
    {
      files: ['env.cjs', 'util/**/*'],
      rules: {
        'node/no-unpublished-import': ['error', {
          'allowModules': devDependencies
        }],
        'node/no-unpublished-require': ['error', {
          'allowModules': devDependencies
        }],
      }
    }
  ]
};
