// https://eslint.org/docs/user-guide/configuring

module.exports = {
  extends: [
    'plugin:@typescript-eslint/recommended',
  ],
  plugins: [
    '@typescript-eslint',
    'import',
  ],
  rules: {
    // https://github.com/import-js/eslint-plugin-import/blob/main/docs/rules/no-extraneous-dependencies.md
    'import/no-extraneous-dependencies': ['error', {
      'devDependencies': false
    }]
  },
  settings: {
    // https://github.com/import-js/eslint-plugin-import#typescript
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts']
    },
    // https://github.com/import-js/eslint-plugin-import#importcore-modules
    'import/core-modules': [
      '@angular/core',
      '@angular/common',
      '@angular/router',
      'rxjs',
      'rxjs/operators'
    ]
  },
};
