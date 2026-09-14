# angular-client-js

Sample app for the opt-in [`@okta/okta-angular/client-js`](../../../README.md#using-oktaokta-angularclient-js-opt-in-beta)
entry point, which adapts [`@okta/okta-client-javascript`](https://github.com/okta/okta-client-javascript)
(the `@okta/auth-foundation`, `@okta/oauth2-flows`, `@okta/spa-platform` packages) to Angular's
functional router primitives.

The sibling apps (`angular-v19`, `angular-v20`, `angular-v21`) all exercise the default,
`@okta/okta-auth-js`-based entry point. This one exercises only the `/client-js` subpath.

It consumes the built library from `../../../dist`, so run `yarn build` at the repo root first.

## This app deliberately does not install `@okta/okta-auth-js`

That is the point, not an oversight. The `/client-js` subpath must never reach the other SDK — not in
its bundle and not in its typings, since an `import type` would land in the published `.d.ts` and
break `tsc` for anyone who hasn't installed the client-js packages. Lint boundaries assert this;
building this app *demonstrates* it.

One consequence: `yarn install` prints

```
warning " > @okta/okta-angular@8.0.0" has unmet peer dependency "@okta/okta-auth-js@^5.4.3 || ..."
```

which is expected and left in place on purpose. `@okta/okta-angular` declares the three client-js
packages as *optional* peers but `@okta/okta-auth-js` as a required one, so a client-js-only consumer
always sees this. Whether that peer should also be optional is a question about the library's
published contract, not about this app.

## Running it

Two terminals. The app is on `:8080`, the resource server on `:8000`.

```bash
# once, from the repo root - the app resolves @okta/okta-angular to ../../../dist
yarn build

cd test/apps/angular-client-js
yarn install

# terminal 1
yarn start:api

# terminal 2 - `prestart` regenerates src/environments/* from your testenv
yarn start
```

`src/environments/environment.ts` is committed with Okta's public samples org so the app builds and
boots with no setup. To point it at your own org, create a `testenv` file at the repo root with
`ISSUER` and `CLIENT_ID` (or `SPA_CLIENT_ID`) — `prebuild.mjs` overwrites both environment files from
it, and throws if either is unset.

Completing a real sign-in requires an Okta app whose **Sign-in redirect URI** includes
`http://localhost:8080/login/callback` and whose **Sign-out redirect URI** includes
`http://localhost:8080/`.

To run the production build instead: `yarn build:prod && yarn start:prod`. Note `bs-config.cjs`
disables lite-server's first middleware (copied from the sibling apps), so deep links may 404 in that
mode; `yarn start` is the better path for exercising routes directly.

## What each route demonstrates

| Route | Exercises |
|---|---|
| `/` | unguarded baseline |
| `/login/callback` | `loginCallbackGuard` as `canActivate`, with `children: []` and no component |
| `/login/error` | where `onLoginCallbackError` redirects when `resumeFlow()` rejects |
| `/protected` | `tokenGuard` as `canActivate`; injects `CLIENT_JS_ORCHESTRATOR` to render claims + `/userinfo` |
| `/protected/child` | a child route inheriting the parent's `canActivate` |
| `/admin` | per-route `AuthorizeParams` via route `data`, typed with `ClientJsRouteData` (step-up for an extra scope) |
| `/messages` | `oktaFetch` from a `ResolveFn` and from a click handler (see below) |
| `/public` → `/public/private` | `canActivateChild` — parent renders for everyone, child does not |
| `/lazy` | `tokenGuard` as `canMatch` + `loadComponent`, so the chunk isn't fetched without a token |

Library surface covered: `provideClientJsAuth`, `tokenGuard`, `loginCallbackGuard`, `oktaFetch`,
`signOut`, `CLIENT_JS_ORCHESTRATOR`, `ClientJsRouteData`. `fetchClient` is exercised *by omission* —
leaving it out is what makes `provideClientJsAuth` build the `new FetchClient(orchestrator)` default.

### The injection-context rule

`oktaFetch` and `signOut` call `inject()` internally, so they inherit Angular's injection-context
rule — they are only valid while Angular is constructing something, or inside a router guard or
resolver. Both sides of that rule are in the app:

- the `messagesResolver` in `app.routes.ts` calls `oktaFetch` directly, because a `ResolveFn` runs in
  an injection context
- `messages.component.ts`'s click handler does **not** have one — a bare call there throws `NG0203`,
  so it goes through `runInInjectionContext(injector, () => oktaFetch(...))`

A component **field initializer** is also a valid position, since construction is an injection
context. `app.component.ts` shows the same escape hatch for `signOut()`.

## `emitBeforeRedirect: false` is required, not a tuning knob

`app.config.ts` constructs the orchestrator as:

```ts
new AuthorizationCodeFlowOrchestrator(flow, { emitBeforeRedirect: false })
```

**Do not drop that option.** `emitBeforeRedirect` defaults to `true`, and when true
`requestToken()` emits `login_prompt_required` and then awaits a promise that only the event
payload's `done()` callback resolves. The SDK's `EventEmitter.emit()` is a no-op when nothing is
listening, so with the default and no registered listener the promise never settles: `getToken()`
hangs, `tokenGuard` never returns, and the navigation stalls forever — no error, no redirect to Okta.

Measured against `@okta/spa-platform@0.6.0`:

| orchestrator init | `requestToken()` | redirect performed |
|---|---|---|
| `{ emitBeforeRedirect: false }` | throws (expected — `PerformRedirect` normally never returns) | yes |
| `{}` (default), no listener | **never settles** | no |
| `{}` (default) + listener calling `done()` | throws (expected) | yes |

Keep the default only if you register a listener, which is the hook to use when you want to run
something — a confirmation prompt, analytics — immediately before the redirect. The redirect happens
when you call `done()`:

```ts
orchestrator.on('login_prompt_required', ({ done }) => done());
```

The root `README.md`'s example passes the option for the same reason.

## Also worth knowing

`AuthorizationCodeFlow` runs `new URL(redirectUri)` with no base argument, so a **relative**
`redirectUri` throws `TypeError: Invalid URL` at construction time. The environment files keep these
relative so the config is host-agnostic, and `app.config.ts` absolutises them against
`window.location.origin`.

There is no `pkce: true` flag anywhere in this app, unlike the sibling apps: `AuthorizationCodeFlow`
is always PKCE.

## The mock resource server

`mock-api/server.mjs` — zero dependencies, plain `node:http`, so it runs before any install.

- `GET /api/messages` — requires `Authorization: Bearer <unexpired JWT>`, else `401`
- `GET /api/boom` — always `500`, so the app's error branch is reachable on demand
- CORS for `http://localhost:8080`, including the `OPTIONS` preflight that lets the `Authorization`
  header through

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
`yarn pretest:e2e` will install and build it (a few minutes more) without running specs against it.
