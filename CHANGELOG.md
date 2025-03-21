# 6.5.1

### Fixes

- [#159](https://github.com/okta/okta-angular/pull/159) fix: adjusts default exports to umd bundle to fix CJS module resolution

# 6.5.0

### Fixes

- [#157](https://github.com/okta/okta-angular/pull/157) fix: adds `exports` block to `package.json` to support modern build tooling, like `vite`

# 6.4.0

### Fixes

- [#140](https://github.com/okta/okta-angular/pull/140) fix: pulls `acr_values` from idToken rather than accessToken

# 6.3.2

### Fixes

- [#134](https://github.com/okta/okta-angular/pull/134) Fixed providing `OKTA_CONFIG` with `OktaAuthModule` when config is loaded at runtime

# 6.3.1

### Fixes

- [#135](https://github.com/okta/okta-angular/pull/135) Fixes okta extended user agent header to correct SDK version

# 6.3.0

### Features

- [#132](https://github.com/okta/okta-angular/pull/132) Supports Step-up authentication in `OktaAuthGuard` by specifying `okta.acrValues` in route data

# 6.2.0

### Features

- [#124](https://github.com/okta/okta-angular/pull/124) Supports asynchronous configuration of `OktaAuthModule` in `APP_INITIALIZER` with `OktaAuthConfigService.setConfig()`

# 6.1.0

### Features

- [#118](https://github.com/okta/okta-angular/pull/118) Supports `OktaAuthModule.forRoot()`

### Others

- [#119](https://github.com/okta/okta-angular/pull/119) Uses `ng-packagr` to build the library in APF v12. Uses `@angular-builders/jest` to run Jest tests with `ng test`.

# 6.0.0

### Breaking Changes

- [#90](https://github.com/okta/okta-angular/pull/90) Enables Ivy engine and partial compiling. Updates library to ESM. Minimum supported version of Angular is 12.

# 5.3.0

### Fixes

- [#99](https://github.com/okta/okta-angular/pull/99) query parameters are now passed through the `canLoad` guard

# 5.2.0

### Others

- [#89](https://github.com/okta/okta-angular/pull/89) Updates okta-auth-js to 6.2.0 in test apps and SDK
- [#91](https://github.com/okta/okta-angular/pull/91) Add Angular version in Okta UA. Add Angular to peerDependencies

# 5.1.1

### Fixes

- [#83](https://github.com/okta/okta-angular/pull/83) Fixes okta-auth-js v6 compatibility issues:
  - allows okta-auth-js v6 in peerDependencies
  - uses available `isInteractionRequiredError` method in `callback.component`

# 5.1.0

### Others

- [#81](https://github.com/okta/okta-angular/pull/81) Set okta-auth-js minimum supported version as 5.3.1, `AuthSdkError` will be thrown if oktaAuth instance cannot meet the version requirement

# 5.0.0

### Breaking Changes

- [#79](https://github.com/okta/okta-angular/pull/79) Uses `OKTA_AUTH` injection token instead of `OktaAuth` type to inject `oktaAuth` instance. This change is introduced to fix production build [issue](https://github.com/okta/okta-angular/issues/72) for Angular v7 & 8. See [MIGRATING](MIGRATING.md) for detailed information.

# 4.1.1

### Fixes

[#74](https://github.com/okta/okta-angular/pull/74) Fixes old version angular compatibility issue

# 4.1.0

### Features

- [#65](https://github.com/okta/okta-angular/pull/65) Supports lazy loaded routes in `OktaAuthGuard`
- [#66](https://github.com/okta/okta-angular/pull/66) Adds lite role/group based authorization directive (`*oktaHasAnyGroup`) to only render content for authorized users (users in groups)

# 4.0.0

### Breaking Changes

[#60](https://github.com/okta/okta-angular/pull/60) See [MIGRATING](MIGRATING.md) for detailed information
  - Enables injecting [oktaAuth](https://github.com/okta/okta-auth-js) instance via `OktaConfig` 
  - Replaces the `OktaAuthService` with the injected `OktaAuth` instance
  - Removes [oktaAuth](https://github.com/okta/okta-auth-js) related configs from `OktaConfig`
  - Removes `isAuthenticated` callback option from `OktaConfig`
  - Removes `OktaLoginRedirectComponent`

### Features

[#60](https://github.com/okta/okta-angular/pull/60) Adds `OktaAuthStateService` that exposes an observable [authState$](https://github.com/okta/okta-auth-js#authstatemanager)


# 3.2.3

### Other

[#58](https://github.com/okta/okta-angular/pull/58) Requires @okta/okta-auth-js ^5.3.1

# 3.2.2

### Bug Fixes

[#51](https://github.com/okta/okta-angular/pull/51) Fix token auto renew by using @okta/okta-auth-js ^5.2.3

# 3.2.1

### Bug Fixes

[#48](https://github.com/okta/okta-angular/pull/48) fix: start tokenService on login redirect 

# 3.2.0

### Other

[#40](https://github.com/okta/okta-angular/pull/40) Requires [@okta/okta-auth-js 5.x](https://github.com/okta/okta-auth-js/#from-4x-to-5x)

# 3.1.0

### Features

[#33](https://github.com/okta/okta-angular/pull/33) Adds option `onAuthResume` to resume authorization flow on custom login page.

# 3.0.1

### Bug Fixes

[#9](https://github.com/okta/okta-angular/pull/9) fix: handle --base-href option

# 3.0.0

[#5](https://github.com/okta/okta-angular/pull/5) Release 3.0.0 - `OktaAuthService` now inherits from an instance of `@okta/okta-auth-js` so all configuration options and public methods are available. See [MIGRATING](MIGRATING.md) for detailed information.

# 2.2.1

### Bug Fixes

[#2](https://github.com/okta/okta-angular/pull/2) Builds library using Angular 7 package format for compatiblity with Angular 7+.

# 2.2.0

### Features

[#794](https://github.com/okta/okta-oidc-js/pull/794) `OktaAuthService.getUser` only uses `/userinfo` endpoint to retrieve user claims. `OktaAuthService.getUser` should be the recommended method to acquire user information as `idToken.claims` may become stale due to data updating.

[#867](https://github.com/okta/okta-oidc-js/pull/867) The current instance of the `OktaAuthService` is passed to `isAuthenticated` callback function.

### Bug Fixes

[#867](https://github.com/okta/okta-oidc-js/pull/867) Default `onSessionExpired` behavior is removed, as it was causing concurrency issues.

# 2.1.0

### Features

[#776](https://github.com/okta/okta-oidc-js/pull/776) `OktaAuthGuard` now implements `canActivateChild`

# 2.0.0

### Breaking Changes

[#690](https://github.com/okta/okta-oidc-js/pull/690)

### Features

- `OktaCallbackComponent` will catch and display exceptions thrown from `handleAuthentication()`
- `onAuthRequired` callbacks will now receive the Angular injector as the 2nd parameter. This change allows logic using any services available within your application.

### Bug Fixes

- Saved URI is now stored in `sessionStorage` instead of `localStorage`. This fixes an issue which can occur when multiple instances of the app are loading at the same time.
- `OktaCallbackComponent` uses `window.location.replace()` to complete the login flow after `handleAuthentication` completes. This fixes an issue where the user could navigate back to the callback hander.

### Breaking Changes

- Signature for `onAuthRequired` callback functions has changed. Callbacks will receive the `OktaAuthService` as the first argument, and the Angular `Injector` as the second argument.
- Static initializer `OktaAuthModule.initAuth()` has been removed. `OKTA_CONFIG` should be provided directly by your module.
- `getFromUri` now returns an absolute URI as a string
- `setFromUri` takes a string. If it is a relative path, it will be converted to an absolute URI before being saved.
- Legacy config formats are no longer supported. See [Configuration Reference](https://github.com/okta/okta-auth-js#configuration-reference) for supported values.
- The `pkce` option now defaults to `true`, using the Authorization Code w/PKCE flow
  - Those using the (previous default) Implicit Flow should pass `pkce: false` to their config
  - See the [@okta/okta-auth-js README regarding PKCE OAuth2 Flow](https://github.com/okta/okta-auth-js#pkce-oauth-20-flow) for PKCE requirements
    - Which include the Application settings in the Okta Admin Dashboard allowing for PKCE

### Other

- Upgrades `@okta/okta-auth-js` to version 3.0.0

# 1.4.0

### Features

- [#648](https://github.com/okta/okta-oidc-js/pull/648)
  - Adds a default handler for onSessionExpired
  - Adds a new option isAuthenticated which works with onAuthRequired
  - Expose TokenManager
  - Adds documentation for postLogoutRedirectUri

# 1.3.1

### Bug fixes

- [#646](https://github.com/okta/okta-oidc-js/pull/646) - Fixes regression with AOT compilation. Also tested against Angular 9.

# 1.3.0

### Features

- [`558696`](https://github.com/okta/okta-oidc-js/commit/5586962c137d7ef0788744dbf0c1dc9f7d411ad0) - Upgrades to `@okta/okta-auth-js@2.11` which includes new options for signout: [`3e8c65`](https://github.com/okta/okta-auth-js/commit/3e8c654b99de771549775eb566f9349c86ed89b6)

# 1.2.3

### Features

- [`558696`](https://github.com/okta/okta-oidc-js/commit/5586962c137d7ef0788744dbf0c1dc9f7d411ad0) - Upgrades to `@okta/okta-auth-js@2.11` which includes new options for signout: [`3e8c65`](https://github.com/okta/okta-auth-js/commit/3e8c654b99de771549775eb566f9349c86ed89b6)

# 1.2.2

### Features

- [`ef10d85`](https://github.com/okta/okta-oidc-js/commit/ef10d856fb6bceba26fac119f0d17db1aaf66a2c) - Support PKCE authorization flow

### Other

- [`654550`](https://github.com/okta/okta-oidc-js/commit/6545506921cbe6e8f15076e45e908f285a6e2f1e) - All configuration options are now accepted. See [Configuration Reference](https://github.com/okta/okta-auth-js#configuration-reference). Camel-case (clientId) is now the preferred syntax for all Okta OIDC libraries. Underscore syntax (client_id) will be deprecated in a future release.

- [`a2a7b3e`](https://github.com/okta/okta-oidc-js/commit/a2a7b3e695d40e29d473be89e90340fbf5c4c56b) - Configuration property `scope` (string) is deprecated in favor of `scopes` (array). Normalize config format for the properties `responseType` and `scopes`, used in get token flows. Fully support deprecated config properties `request_type` and `scope` as previously documented and used within the okta-angular samples.

# 1.2.1

### Other
- [`0703aff`](https://github.com/okta/okta-oidc-js/commit/0703afff55d9ab3a3c3ec608e45e06c969542d73) - Relaxes peerDependency to include latest versions of Angular

# 1.2.0

### Other
- [`f972822`](https://github.com/okta/okta-oidc-js/commit/f972822542792275bfe645813c8487dcef45de36) - Deprecates 'initAuth' method.

# 1.1.0

### Features

- [`2ae1eff`](https://github.com/okta/okta-oidc-js/commit/2ae1effe948c35d112f58f12fbf3b4730e3a24e4) - Adds TokenManager configuration parameters.

# 1.0.7

### Other

- [`2945461`](https://github.com/okta/okta-oidc-js/pull/338/commits/294546166a41173b699579d7d647ba7d5cab0764) - Updates `@okta/configuration-validation` version

# 1.0.6

### Bug fixes

- [`6242f2d`](https://github.com/okta/okta-oidc-js/pull/332/commits/6242f2d1586aabd80e60b3b237d5b5136bfd95e9) - Fixes an issue where the library was not correctly building the `/dist` output before publishing to `npm`.

# 1.0.5

### Features

- [`29d04f6`](https://github.com/okta/okta-oidc-js/pull/320/commits/29d04f69a267cac7400475abca1d2b5e474e1730) - Adds configuration validation for `issuer`, `clientId`, and `redirectUri` when passed into the auth service.

### Other

- [`3582f25`](https://github.com/okta/okta-oidc-js/pull/318/commits/3582f259cf74dbb45b6eed673065c2d3c03e9db3) - Rely on shared environment configuration from project root.
- [`c8b7ab5a`](https://github.com/okta/okta-oidc-js/commit/c8b7ab5aacecf5793efb6a626c0a24a78147ded9#diff-b8cfe5f7aa410fb30a335b09346dc4d2) - Migrate dependencies to project root utilizing [yarn workspaces](https://yarnpkg.com/lang/en/docs/workspaces/).

# 1.0.4

### Bug fixes

- [`5862e32`](https://github.com/okta/okta-oidc-js/commit/5862e320547ef5dd24ac5717480514f71f72bab3) - Fixes an issue where the library would enter an error state when attempting to renew expired tokens (errorCode: `login_required`).

# 1.0.3

### Other

- Updated `@okta/okta-auth-js` dependency to version 2.

# 1.0.2

### Other

- The supported range of Angular peer dependencies has been upgraded to include versions 4, 5, and 6.  At the moment we only test on the latest stable version of Angular, currently version 6.
