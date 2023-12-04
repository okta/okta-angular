import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
const require = createRequire(import.meta.url);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectPath = path.join(__dirname, '..');
const packageJsonPath = path.join(projectPath, 'lib', 'package.json');
const destPath = path.join(projectPath, 'lib', 'src', 'okta', 'packageInfo.ts');

const packageJson = require(packageJsonPath);
const packageInfo = {
  name: packageJson.name,
  version: packageJson.version,
  authJSMinSupportedVersion: '5.3.1'
};
const output = 'export default ' + JSON.stringify(packageInfo, null, 2).replace(/"/g, '\'') + ';\n';

console.log('Writing config to', destPath);

fs.writeFileSync(destPath, output);
