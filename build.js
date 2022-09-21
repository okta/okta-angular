"use strict";

import shell from 'shelljs';
import chalk from 'chalk';
import fs from 'fs';

const PACKAGE = `okta-angular`;
const NPM_DIR = `dist`;
const ESM2015_DIR = `${NPM_DIR}/esm2015`;
const FESM2015_DIR = `${NPM_DIR}/fesm2015`;
const ESM2020_DIR = `${NPM_DIR}/esm2020`;
const FESM2020_DIR = `${NPM_DIR}/fesm2020`;
const OUT_DIR = `${NPM_DIR}/package`;

shell.echo(`Start building...`);

shell.rm(`-Rf`, `${NPM_DIR}/*`);
shell.mkdir(`-p`, `./${ESM2015_DIR}`);
shell.mkdir(`-p`, `./${FESM2015_DIR}`);
shell.mkdir(`-p`, `./${ESM2020_DIR}`);
shell.mkdir(`-p`, `./${FESM2020_DIR}`);
shell.mkdir(`-p`, `./${OUT_DIR}`);

/* TSLint with Codelyzer */
// https://github.com/palantir/tslint/blob/master/src/configs/recommended.ts
// https://github.com/mgechev/codelyzer
shell.echo(`Start lint`);
shell.exec(`yarn lint`);
shell.echo(chalk.green(`lint completed`));

shell.cp(`-Rf`, [`src`, `*.ts`, `*.json`], `${OUT_DIR}`);

/* AoT compilation */
shell.echo(`Start AoT compilation`);
if (shell.exec(`ngc -p ${OUT_DIR}/tsconfig-build.json`).code !== 0) {
    shell.echo(chalk.red(`Error: AoT compilation failed`));
    shell.exit(1);
}
shell.echo(chalk.green(`AoT compilation completed`));

shell.echo(`Copy ES2015 for package`);
shell.cp(`-Rf`, [`${NPM_DIR}/src/`, `${NPM_DIR}/*.js`, `${NPM_DIR}/*.js.map`], `${ESM2015_DIR}`);
shell.rm(`-Rf`, `${ESM2015_DIR}/src/**/*.d.ts`);

/* BUNDLING PACKAGE */
shell.echo(`Start bundling`);

shell.echo(`Produce FESM2015 version`);
if (shell.exec(`rollup -c rollup.es.config.js -i ${NPM_DIR}/${PACKAGE}.js -o ${FESM2015_DIR}/${PACKAGE}.js`).code !== 0) {
    shell.echo(chalk.red(`Error: FESM2015 version failed`));
    shell.exit(1);
}

shell.echo(`Produce ESM2020 version`);
if (shell.exec(`ngc -p ${OUT_DIR}/tsconfig-build.json --target es2020 -d false --sourceMap`).code !== 0) {
    shell.echo(chalk.red(`Error: ESM2020 version failed`));
    shell.exit(1);
}
shell.cp(`-Rf`, [`${NPM_DIR}/src/`, `${NPM_DIR}/*.js`, `${NPM_DIR}/*.js.map`], `${ESM2020_DIR}`);
shell.rm(`-Rf`, `${ESM2020_DIR}/src/**/*.d.ts`);

shell.echo(`Produce FESM2020 version`);
if (shell.exec(`rollup -c rollup.es.config.js -i ${NPM_DIR}/${PACKAGE}.js -o ${FESM2020_DIR}/${PACKAGE}.js`).code !== 0) {
    shell.echo(chalk.red(`Error: FESM2020 version failed`));
    shell.exit(1);
}

shell.echo(chalk.green(`Bundling completed`));

shell.rm(`-Rf`, `${NPM_DIR}/package`);
shell.rm(`-Rf`, `${NPM_DIR}/*.js`);
shell.rm(`-Rf`, `${NPM_DIR}/*.js.map`);
shell.rm(`-Rf`, `${NPM_DIR}/src/**/*.js`);
shell.rm(`-Rf`, `${NPM_DIR}/src/**/*.js.map`);

shell.cp(`-Rf`, [`package.json`, `LICENSE`, `README.md`, `CHANGELOG.md`], `${NPM_DIR}`);

shell.echo(`Modifying final package.json`);
let packageJSON = JSON.parse(fs.readFileSync(`./${NPM_DIR}/package.json`));
delete packageJSON.private; // remove private flag
delete packageJSON.scripts; // remove all scripts
delete packageJSON.jest; // remove jest section
delete packageJSON.workspaces; // remove yarn workspace section

// Remove "dist/" from the entrypoint paths.
['main', 'module', 'es2015', 'esm2015', 'fesm2015', 'es2020', 'esm2020', 'fesm2020', 'types', 'typings'].forEach(function(key) {
  if (packageJSON[key]) { 
    packageJSON[key] = packageJSON[key].replace(`${NPM_DIR}/`, '');
  }
});
const removeDistFromPaths = (exports) => {
  if (exports) {
    for (const [key, value] of Object.entries(exports)) {
      if (typeof value === 'object') {
        removeDistFromPaths(value);
      } else {
        exports[key] = value.replace(`${NPM_DIR}/`, '');
      }
    }
  }
};
removeDistFromPaths(packageJSON.exports);

fs.writeFileSync(`./${NPM_DIR}/package.json`, JSON.stringify(packageJSON, null, 4));

shell.echo(chalk.green(`End building`));
