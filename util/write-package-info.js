const fs = require('fs');
const path = require('path');
const semver = require('semver');

const workingDirectory = process.argv[2];
const destinationFile = process.argv[3];
const packageJsonPath = path.join(process.cwd(), workingDirectory, 'package.json');
const configDest = path.join(process.cwd(), workingDirectory, destinationFile);
const packageJson = require(packageJsonPath);
const authJsVersion = packageJson.peerDependencies['@okta/okta-auth-js'];
const authJSMajorVersion = semver.minVersion(authJsVersion).major;
const packageInfo = {
  name: packageJson.name,
  version: packageJson.version,
  authJSMajorVersion
};
const output = 'export default ' + JSON.stringify(packageInfo, null, 2).replace(/"/g, '\'') + ';\n';

console.log('Writing config to', configDest);

fs.writeFileSync(configDest, output);
