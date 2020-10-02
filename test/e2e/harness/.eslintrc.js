// https://eslint.org/docs/user-guide/configuring

const packageJson = require('./package.json');
const devDependencies = Object.keys(packageJson.devDependencies || {});

module.exports = {
  globals: {
    jasmine: true
  },
  rules: {
    'node/no-unpublished-require': ['error', {
      'allowModules': devDependencies
    }]    
  }
};
