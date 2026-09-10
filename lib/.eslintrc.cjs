const path = require('path');

// Packages that make up `@okta/okta-client-javascript`. They are *optional* peer dependencies: only
// consumers who import `@okta/okta-angular/client-js` are expected to have them installed, so the
// default entry point must never reach them - not even through a type-only import, which would put
// them in the published `.d.ts` and break `tsc` for everyone else.
//
// Listed as `patterns` with `/*` globs rather than `paths`: `no-restricted-imports`'s `paths` only
// matches the exact specifier, so `@okta/auth-foundation/core` (where `addEnv` and friends also
// live) would sail straight through an exact-name rule.
const CLIENT_JS_PACKAGES = [
  '@okta/auth-foundation',
  '@okta/auth-foundation/*',
  '@okta/oauth2-flows',
  '@okta/oauth2-flows/*',
  '@okta/spa-platform',
  '@okta/spa-platform/*',
];

module.exports = {
  extends: '../.eslintrc.json',
  ignorePatterns: ['!**/*'],
  overrides: [
    {
      files: ['*.ts'],
      rules: {
        '@angular-eslint/directive-selector': [
          'error',
          {
            type: 'attribute',
            prefix: 'okta',
            style: 'camelCase',
          },
        ],
        '@angular-eslint/component-selector': [
          'error',
          {
            type: 'element',
            style: 'kebab-case',
          },
        ],
      },
    },
    {
      files: ['*.html'],
      rules: {},
    },
    {
      // Everything in the default `lib/src/public-api.ts` bundle. Keeps `@okta/okta-angular`
      // installable and buildable with `@okta/okta-auth-js` alone.
      files: ['src/**/*.ts'],
      plugins: ['import'],
      settings: {
        // `import/no-restricted-paths` silently does nothing for specifiers it can't resolve, and
        // the default node resolver doesn't know about `.ts`.
        'import/resolver': {
          node: { extensions: ['.ts', '.tsx', '.mjs', '.js', '.json'] },
        },
      },
      rules: {
        'import/no-restricted-paths': ['error', {
          // Zone paths are resolved against `basePath` (defaulting to `process.cwd()`), so without
          // this the zones only match when lint is invoked from the repo root.
          basePath: path.join(__dirname, '..'),
          zones: [{
            target: './lib/src',
            from: './lib/client-js',
            message: 'lib/client-js/** is a separate, optional entry point - do not import it from the default okta-angular entry point.',
          }],
        }],
        'no-restricted-imports': ['error', {
          patterns: [{
            group: CLIENT_JS_PACKAGES,
            message: '@okta/okta-client-javascript packages are optional peer dependencies and must stay behind the `@okta/okta-angular/client-js` subpath. Put this code in lib/client-js/ instead.',
          }],
        }],
      },
    },
    {
      // The opt-in subpath. `@okta/okta-auth-js` is the *other* SDK: mixing the two in one module
      // would defeat the point of keeping them separable.
      files: ['client-js/**/*.ts'],
      rules: {
        'no-restricted-imports': ['error', {
          patterns: [{
            group: ['@okta/okta-auth-js', '@okta/okta-auth-js/*'],
            message: 'lib/client-js/ is the @okta/okta-client-javascript path and must not depend on @okta/okta-auth-js.',
          }],
        }],
      },
    },
  ],
};
