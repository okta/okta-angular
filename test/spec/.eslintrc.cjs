// https://eslint.org/docs/user-guide/configuring

module.exports = {
  extends: [
    'plugin:jest/recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  plugins: [
    'jest',
    '@typescript-eslint'
  ],
  env: {
    jest: true
  }
};
