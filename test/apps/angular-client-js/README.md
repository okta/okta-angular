# angular-client-js

Sample app for the opt-in [`@okta/okta-angular/client-js`](../../../README.md#using-oktaokta-angularclient-js-opt-in-beta)
entry point, which adapts [`@okta/okta-client-javascript`](https://github.com/okta/okta-client-javascript)
(the `@okta/auth-foundation`, `@okta/oauth2-flows`, `@okta/spa-platform` packages) to Angular's
functional router primitives.

The sibling apps (`angular-v19`, `angular-v20`, `angular-v21`) exercise the default,
`@okta/okta-auth-js`-based entry point. This one exercises only the `/client-js` subpath, and
deliberately does not install `@okta/okta-auth-js` — so building it also verifies that the subpath's
bundle and typings never reach the other SDK. `yarn install` prints an unmet-peer warning for
`@okta/okta-auth-js` as a result, which is expected.

## Running it

Two terminals. The app is on `:8080`, the mock resource server on `:8000`.

```bash
# once, from the repo root - the app resolves @okta/okta-angular to ../../../dist
yarn build

cd test/apps/angular-client-js
yarn install

# terminal 1
yarn start:api

# terminal 2
yarn start
```

`yarn start` needs a `testenv` file at the repo root with `ISSUER` and `CLIENT_ID` (or
`SPA_CLIENT_ID`): `prestart` runs `prebuild.mjs`, which throws if either is unset. It regenerates
`src/environments/environment.ts`, a tracked file, so check it out again before committing.

To boot without a `testenv`, run `npx ng serve` — that skips `prebuild.mjs` and uses the committed
`environment.ts`, which points at Okta's public samples org.

Completing a sign-in requires an Okta app whose **Sign-in redirect URI** includes
`http://localhost:8080/login/callback` and whose **Sign-out redirect URI** includes
`http://localhost:8080/`. `/admin` additionally needs the authorization server to grant the `groups`
scope.

## What each route demonstrates

| Route | Exercises |
|---|---|
| `/` | unguarded baseline |
| `/login/callback` | `loginCallbackGuard` as `canActivate`, with `children: []` and no component |
| `/login/error` | where `onLoginCallbackError` redirects when `resumeFlow()` rejects |
| `/protected` | `tokenGuard` as `canActivate`; injects `CLIENT_JS_ORCHESTRATOR` to render claims + `/userinfo` |
| `/admin` | per-route `AuthorizeParams` via route `data`, typed with `ClientJsRouteData` (scope step-up) |
| `/messages` | `oktaFetch` from a `ResolveFn`, and `CLIENT_JS_FETCH_CLIENT` from a click handler |
| `/public` → `/public/private` | `canActivateChild` — parent renders for everyone, child does not |
| `/lazy` | `tokenGuard` as `canMatch` + `loadComponent`, so the chunk isn't fetched without a token |

Library surface covered: `provideClientJsAuth`, `tokenGuard`, `loginCallbackGuard`, `oktaFetch`,
`signOut`, `CLIENT_JS_ORCHESTRATOR`, `CLIENT_JS_FETCH_CLIENT`, `ClientJsRouteData`. `fetchClient` is
exercised *by omission* — leaving it out of `provideClientJsAuth` is what makes it build the
`new FetchClient(orchestrator)` default. Not covered: `CLIENT_JS_CONFIG`, `CLIENT_JS_SIGN_OUT_FLOW`,
and `signOut`'s `SignOutOptions`.

`oktaFetch` and `signOut` call `inject()` internally, so they only work from an injection context — a
field initializer, a guard, or a `ResolveFn`. `app.config.ts` and the components carry comments where
that or any other client-js constraint shapes the code.

## The mock resource server

`mock-api/server.mjs` — zero dependencies, plain `node:http`, so it runs before any install.

- `GET /api/messages` — requires `Authorization: Bearer <unexpired JWT>`, else `401`
- `GET /api/boom` — always `500`, so the app's error branch is reachable on demand
- CORS for `http://localhost:8080`, including the `OPTIONS` preflight

> **It does not verify token signatures.** It base64url-decodes the payload and checks `exp` (and
> `iss`, if `ISSUER` is set). Any well-formed unexpired JWT is accepted, including one you mint
> yourself. That is fine for a local harness and unacceptable anywhere else. A real resource server
> must fetch the authorization server's JWKS and verify the signature, `aud`, and `iss` — use
> [`@okta/jwt-verifier`](https://github.com/okta/okta-jwt-verifier-js).

Env vars: `PORT` (default `8000`), `APP_ORIGIN` (default `http://localhost:8080`), `ISSUER`
(optional; enables the `iss` check).

## Not wired into e2e

`test/e2e/runner.cjs` has a hardcoded list of apps and runs the *same* `specs/**/*.js` against each;
those specs drive the `okta-auth-js` UI and would fail here. Adding this app to e2e needs a second
WDIO config, and passing specs need org credentials. This app is manual-only for now.

It *is* picked up by `scripts/build-test-apps.sh`, which globs `test/apps/angular-*`, so
`yarn pretest:e2e` will install and build it without running specs against it.
