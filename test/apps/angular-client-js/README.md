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
break `tsc` for anyone who hasn't installed the client-js packages. Building this app demonstrates
that end to end: it compiles with the package absent, and `okta-auth-js` appears nowhere in the
output bundle.

`yarn install` prints an unmet-peer warning for `@okta/okta-auth-js`, which is expected and left in
place on purpose — the three client-js packages are *optional* peers of `@okta/okta-angular` while
`@okta/okta-auth-js` is a required one.

## Running it

Two terminals. The app is on `:8080`, the resource server on `:8000`.

```bash
# once, from the repo root - the app resolves @okta/okta-angular to ../../../dist
yarn build

cd test/apps/angular-client-js
yarn install

# terminal 1
yarn start:api

# terminal 2 - `prestart` regenerates src/environments/environment.ts from your testenv
yarn start
```

`yarn start` requires a `testenv` file at the repo root with `ISSUER` and `CLIENT_ID` (or
`SPA_CLIENT_ID`): `prestart` runs `prebuild.mjs`, which overwrites `src/environments/environment.ts`
and **throws if either is unset**. Note that this rewrites a tracked file with your org's values, so
check it out again before committing.

Without a `testenv`, run `npx ng serve` instead — that skips `prebuild.mjs` and uses the committed
`environment.ts`, which points at Okta's public samples org.

Completing a real sign-in requires an Okta app whose **Sign-in redirect URI** includes
`http://localhost:8080/login/callback` and whose **Sign-out redirect URI** includes
`http://localhost:8080/`. `/admin` additionally needs the authorization server to grant the `groups`
scope; if it doesn't, that route fails rather than stepping up.

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

### The injection-context rule

`oktaFetch` and `signOut` call `inject()` internally, so they inherit Angular's injection-context
rule — they are only valid while Angular is constructing something, or inside a router guard or
resolver. Both sides of that rule are in the app:

- the `messagesResolver` in `app.routes.ts` calls `oktaFetch` directly, because a `ResolveFn` runs in
  an injection context
- `app.component.ts`'s logout handler does **not** have one — a bare `signOut()` there throws
  `NG0203`, so it goes through `runInInjectionContext(injector, () => signOut())`

For fetching there is a better answer than the escape hatch. `oktaFetch(url)` is exactly
`inject(CLIENT_JS_FETCH_CLIENT).fetch(url)`, so a component that fetches from an event handler should
inject the token in a field initializer and keep the client — which is what
`messages.component.ts` does.

### Scope matching is a subset test, in whichever direction

Worth knowing before you copy `/admin`. `selectCredential` compares scopes with
`hasSameValues(requested, stored, false)`, and that non-strict mode takes the **larger** of the two
sets and asks whether the smaller fits inside it. So requesting your configured scopes *plus* one more
matches the credential you already have, and no step-up happens:

```ts
// configured: ['openid', 'profile', 'email']
params: { scopes: ['openid', 'profile', 'email', 'groups'] }  // matches the existing credential
params: { scopes: ['openid', 'groups'] }                      // no match -> fresh authorize request
```

`/admin` uses the second form. Only `scopes` and `tags` participate in matching, so `acrValues` and
`maxAge` on a route's `params` will **not** trigger a step-up — they are sent on the authorize request
if one happens, but they can never cause one.

## `emitBeforeRedirect: false` is required, not a tuning knob

`app.config.ts` constructs the orchestrator as:

```ts
new AuthorizationCodeFlowOrchestrator(flow, { emitBeforeRedirect: false })
```

**Do not drop that option.** `emitBeforeRedirect` defaults to `true`, and when true `requestToken()`
emits `login_prompt_required` and then awaits a promise that only the event payload's `done()`
callback resolves. `EventEmitter.emit()` iterates `listeners[event] ?? []`, so with nothing listening
it is a no-op and the promise never settles: `getToken()` hangs, `tokenGuard` never returns, and the
navigation stalls forever — no error, no redirect to Okta.

Keep the default only if you register a listener, which is the hook for running something — a
confirmation prompt, analytics — immediately before the redirect. The redirect happens when you call
`done()`:

```ts
orchestrator.on('login_prompt_required', ({ done }) => done());
```

The root `README.md`'s example passes the option for the same reason.

## The return-URL gap, and why this app sets `urlUpdateStrategy: 'eager'`

The orchestrator records where to come back to by calling its `getOriginalUri` option, which defaults
to reading `window.location.href` — and it calls it *inside* `requestToken`, i.e. while `tokenGuard`
is still running. Angular's default `urlUpdateStrategy` is `'deferred'`, so at that moment the address
bar still holds the **previous** URL. Signing in by clicking a link to `/protected` would therefore
capture `/` and land you back on `/` afterwards.

The default entry point doesn't have this problem: its guard passes the router's own `state.url` to
`setOriginalUri`. The client-js path has no equivalent, because the orchestrator resolves the URL
itself and never sees the pending navigation. So this app commits the URL before guards run:

```ts
provideRouter(routes, withRouterConfig({ urlUpdateStrategy: 'eager' }))
```

The alternative is to pass your own `getOriginalUri` that reads
`router.getCurrentNavigation()?.extractedUrl`. Either way, do one of them — with neither, only
deep-links restore correctly and in-app navigation silently doesn't.

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
- CORS for `http://localhost:8080`, including the `OPTIONS` preflight

Two things a real resource server for this SDK has to get right, both learned here the hard way:

- **`X-Okta-User-Agent-Extended` must be in `Access-Control-Allow-Headers`.** `APIClient` adds it to
  every request and it is not a CORS-simple header, so a server that omits it makes the browser never
  send the real request — the app sees an opaque "Failed to fetch" and the server logs nothing. `curl`
  can't catch this, because `curl` doesn't preflight.
- A `401` shows up **twice** in the server log: `FetchClient` retries once after refreshing.

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
