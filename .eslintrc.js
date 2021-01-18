// https://eslint.org/docs/user-guide/configuring

const packageJson = require('./package.json');
const devDependencies = Object.keys(packageJson.devDependencies || {});

module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:node/recommended-script'
  ],
  plugins: [
    'node'
  ],
  rules: {
    'semi': ['error', 'always'],
  },
  settings: {
    node: {
      tryExtensions: ['.js', '.ts']
    }
  },
  overrides: [
    {
      // ES6/browser processed by Babel
      files: [
        'src/**/*',
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
        'node/no-unsupported-features/es-syntax': 0,
        'node/no-unsupported-features/node-builtins': 0,
        'node/no-unpublished-import': ['error', {
          'allowModules': devDependencies
        }]
      }
    },
    {
      // NodeJS build tools
      files: ['build.js', 'env.js', 'util/**/*'],
      rules: {
        'node/no-unpublished-require': ['error', {
          'allowModules': devDependencies
        }]    
      }
    },
    {
      // Rollup configs
      files: ['rollup*.js'],
      parserOptions: {
        sourceType: 'module'
      },
      rules: {
        'node/no-unsupported-features/es-syntax': 0,
        'node/no-unpublished-import': ['error', {
          'allowModules': devDependencies
        }]
      }
    }
  ]
};
