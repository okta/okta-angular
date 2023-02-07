import fs from 'fs';
import globby from 'globby';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const bannerSourcePath = path.join(__dirname, 'license-template.txt');
const files = globby.sync(path.join(__dirname, '..','lib/**/*.{js,ts},test/integration-test/*.{js,ts},test/e2e/**/*.{js,ts}}'));
// console.log(files);
const bannerSource = fs.readFileSync(bannerSourcePath).toString();
const copyrightRegex = /(Copyright \(c\) )([0-9]+)-?([0-9]+)?/;
const match = bannerSource.match(copyrightRegex);
const firstYear = match[2];
const currentYear = new Date().getFullYear().toString();

if (firstYear !== currentYear) {
  fs.writeFileSync(bannerSourcePath, bannerSource.replace(copyrightRegex, `$1$2-${currentYear}`));
}

files.forEach(file => {
  const contents = fs.readFileSync(file).toString();
  const match = contents.match(copyrightRegex);
  if (!match) {
    return fs.writeFileSync(file, bannerSource + '\n\n' + contents);
  }
  const firstYear = match[2];
  if (firstYear !== currentYear) {
    return fs.writeFileSync(file, contents.replace(copyrightRegex, `$1$2-${currentYear}`));
  }
});
