# Test Apps

This folder includes Angular test apps cross all supported Angular versions (12 - 15). All apps are generated via @angular/cli, then small adjustment has been added to support the E2E testing requirements.

## How to setup a new test app

0. Rename the toplevel `angular.json` temporarily

1. Outside repo directory, run the following command

```bash
npx @angular/cli@<version> new angular-v<version> --directory <rel/path/to/repo>/test/apps/angular-v<version> --skip-git --minimal --style css --ssr false 
```
**Note:** replace `<version>` in the script with the Angular version for the new app.

2. Copy `prebuild.js` from the existing test apps. The `prebuild` script loads okta test configs from `testenv`, then add it to Angular's environment module (`src/environments`).

3. Update `scripts` and `workspaces` field in package.json by following `package.json` in the existing apps. In particular, add a `start:prod` script (`ng serve --configuration production --port 8080`) and a matching `prestart:prod` script (`node ./prebuild.mjs`), so the e2e tests can run against a production-configuration build served by Angular's own dev server.

4. Update `angular.json` for the new version by adding `allowedCommonJsDependencies` property to the `build` configuration. Add any CommonJS dependencies used by Okta AuthJS. This property suppresses CJS warnings.

5. Once above steps are finished, try the newly generated app locally first. If everything looks good, then update `runner.cjs` under `e2e` folder to bind e2e tests with the new app.

6. Restore toplevel `angular.json` 

7. Push a commit and test on bacon.
