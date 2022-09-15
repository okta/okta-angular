# Test Apps

This folder includes Angular test apps cross all supported Angular versions (7 - 14). All apps are generated via @angular/cli, then small adjustment has been added to support the E2E testing requirements.

## How to setup a new test app

1. Generate a new Angular app with @angular/cli under `test/apps` directory.

**Note:** repalce `{version}` in the script with the Angular version for the new app.

```bash
nxp @angular/cli@{version} new angular-v{version}
```
2. Copy `prebuild.js` from the exising test apps. The `prebuild` script loads okta test configs from `testenv`, then add it to Angular's environment module (`src/environments`).
3. Update `scripts` and `workspaces` field in package.json by following `package.json` in the exising apps.
4. Add `lite-server` in `devDependencies`, so the e2e tests can run against the prod build artifacts. `bs-config.cjs` should also be copied over as the static server's config file.
5. Once above steps are finished, try the newly generated app locally first. If everything looks good, then update `runner.cjs` under `e2e` folder to bind e2e tests with the new app.
6. Push a commit and test on bacon.
