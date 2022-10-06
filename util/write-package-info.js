import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const workingDirectory = process.argv[2];
const destinationFile = process.argv[3];
const packageJsonPath = path.join(process.cwd(), workingDirectory, 'package.json');
const configDest = path.join(process.cwd(), workingDirectory, destinationFile);
const packageJson = require(packageJsonPath);
const packageInfo = {
  name: packageJson.name,
  version: packageJson.version,
  authJSMinSupportedVersion: '5.3.1'
};
const output = 'export default ' + JSON.stringify(packageInfo, null, 2).replace(/"/g, '\'') + ';\n';

console.log('Writing config to', configDest);

fs.writeFileSync(configDest, output);
