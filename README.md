[@okta/okta-auth-js]: https://github.com/okta/okta-auth-js
[Migrate your Angular app to standalone]: https://angular.dev/reference/migrations/standalone# 
[@angular/router]: https://angular.dev/guide/routing
[Dependency Injection]: https://angular.dev/guide/di
[AuthState]: https://github.com/okta/okta-auth-js#authstatemanager
[external identity provider]: https://developer.okta.com/docs/concepts/identity-providers/

# Okta Angular SDK

[![npm version](https://img.shields.io/npm/v/@okta/okta-angular.svg?style=flat-square)](https://www.npmjs.com/package/@okta/okta-angular)
[![build status](https://img.shields.io/travis/okta/okta-angular/master.svg?style=flat-square)](https://travis-ci.org/okta/okta-angular)

Okta Angular SDK builds on top of [@okta/okta-auth-js][]. This SDK adds integration with [@angular/router][] and provides additional logic and components designed to help you quickly add authentication and authorization to your Angular single-page web application.

With [@okta/okta-auth-js][], you can:

- Login and logout from Okta using the [OAuth 2.0 API](https://developer.okta.com/docs/api/resources/oidc)
- Retrieve user information
- Determine authentication status
- Validate the current user's session

All of these features are supported by this SDK. Additionally, using this SDK, you can:

- Add "protected" routes, which will require authentication before render
- Define custom logic/behavior when authentication is required
- Subscribe to changes in authentication state using an [Observable] property
- Provide an instance of the [OktaAuthService][] to your components using [Dependency Injection][]

> This SDK does not provide any UI components.
> This SDK does not currently support Server Side Rendering (SSR)

This library currently supports:

- [OAuth 2.0 Implicit Flow](https://tools.ietf.org/html/rfc6749#section-1.3.2)
- [OAuth 2.0 Authorization Code Flow](https://tools.ietf.org/html/rfc6749#section-1.3.1) with [Proof Key for Code Exchange (PKCE)](https://tools.ietf.org/html/rfc7636)

> This library has been tested for compatibility with the following Angular versions: 19, 20, 21

> [!IMPORTANT] 
> **`okta-angular` 8.0+ supports Angular 19 - 21.** 
> * For Angular 16-19, please use `okta-angular` 7.x. 
> * For Angular 12-16, please use `okta-angular` 6.x. 
> * For Angular 7 to 11, please use `okta-angular` 5.x

> [!WARNING] 
> Angular versions older than 19 may not be fully compatible with all dependencies of this library, due to use of constructs such as `InputSignal`.

## Release Status

:heavy_check_mark: The current stable major version series is: `7.x`

| Version   | Status                           |
| -------   | -------------------------------- |
| `8.x`     | :heavy_check_mark: Stable        |
| `7.x`     | :heavy_check_mark: Maintenance   |
| `6.x`     | :x: Retired   |
| `5.x`     | :x: Retired                      |
| `4.x`     | :x: Retired                      |
| `3.x`     | :x: Retired                      |
| `2.x`     | :x: Retired                      |
| `1.x`     | :x: Retired                      |

## Getting Started

- If you do not already have a **Developer Edition Account**, you can create one at [https://developer.okta.com/signup/](https://developer.okta.com/signup/).
- An Okta Application, configured for Single-Page App (SPA) mode. This is done from the Okta Developer Console and you can find instructions [here](https://developer.okta.com/docs/guides/implement-grant-type/authcodepkce/main/). When following the wizard, use the default properties. They are are designed to work with our sample applications.

### Helpful Links

- [Angular Essentials](https://angular.dev/essentials)
  - If you don't have an Angular app, or are new to Angular, please start with this guide. It will walk you through the creation of an Angular app, creating routes, and other application development essentials.
- [Okta Sample Application](https://github.com/okta/samples-js-angular)
  - A fully functional sample application.
- [Okta Guide: Sign users into your single-page application](https://developer.okta.com/docs/guides/sign-into-spa/angular/before-you-begin/)
  - Step-by-step guide to integrating an existing Angular application with Okta login.
- [Strategies for Obtaining Tokens](https://github.com/okta/okta-auth-js#strategies-for-obtaining-tokens)
  - Okta Angular SDK supports `PathStrategy` and `HashStrategy` for more details please check specific section of `okta-auth-js`

## Installation

This library is available through [npm](https://www.npmjs.com/package/@okta/okta-angular). To install it, simply add it to your project:

```bash
npm install @okta/okta-angular @okta/okta-auth-js
```

## Usage

Add [`provideOktaAuth()`](provideOktaAuth) to your app config's provider's array.
Create a configuration object and provide this within the [`withOktaConfig()`](#okta_config) configuration option.

```typescript
// app.config.ts

import { 
  provideOktaAuth, 
  withOktaConfig 
} from '@okta/okta-angular';
import { OktaAuth } from '@okta/okta-auth-js';

const authConfig = {
  issuer: 'https://{yourOktaDomain}/oauth2/default',
  clientId: '{clientId}',
  redirectUri: window.location.origin + '/login/callback'
}
const oktaAuth = new OktaAuth(authConfig);

export const appConfig: ApplicationConfig = {
  providers: [
    // other providers as required for your app
    provideOktaAuth(
      withOktaConfig({ oktaAuth })
    )
  ]
};
```

### Provide config at runtime during application initialization

Starting with `okta-angular 6.2.0`, you can provide `OktaConfig` at runtime using the `APP_INITIALIZER` injection token or the `provideAppInitializer()` provider. The `setConfig()` method in the `OktaAuthConfigService` allows you to load the `OktaConfig` at runtime. A real-world scenario for this is if you want to load your Okta config values via an HTTP request.

```typescript
// app.config.ts

import { 
  provideOktaAuth, 
  withOktaConfig 
} from '@okta/okta-angular';
import { OktaAuth } from '@okta/okta-auth-js';

export const appConfig: ApplicationConfig = {
  providers: [
    // other providers as required for your app
    provideAppInitializer(() => {
      const configService = inject(OktaAuthConfigService);
      const http = inject(HttpBackend);
      
      return firstValueFrom(
        new HttpClient(httpBackend)
          .get('/api/config')
          .pipe(
            map((res: any) => ({
              issuer: res.issuer,
              clientId: res.clientId,
              redirectUri: window.location.origin + '/login/callback'
            })),
            tap((authConfig: OktaAuthOptions) => {
              const oktaAuth = new OktaAuth(authConfig);
              const oktaConfig: OktaConfig = { oktaAuth };
              configService.setConfig(oktaConfig);
            })
          );
      )
    }),
    provideHttpClient(),
    provideOktaAuth()
  ]
};
```

### `OktaConfig`

You provide the `OktaConfig` using the `withOktaConfig()` provider configuration option or by manually setting it as shown in the runtime example.

The OktaConfig is accessible within your application as an injection token.

- `oktaAuth` *(required)*: - [OktaAuth][@okta/okta-auth-js] instance. The instance that can be shared cross different components of the application. One popular use case is to share one single instance cross the application and [Okta Sign-In Widget](https://github.com/okta/okta-signin-widget).
- `onAuthRequired` *(optional)*: - callback function. Triggered when a route protected by `OktaAuthGuard` is accessed without authentication or without needed level of end-user assurance (if `okta.acrValues` is provided in route data). Use this to present a [custom login page](#using-a-custom-login-page). If no `onAuthRequired` callback is defined, `okta-angular` will redirect directly to Okta for authentication.
- `onAuthResume` *(optional)*: - callback function. Only relevant if using a [custom login page](#using-a-custom-login-page). Called when the [authentication flow should be resumed by the application](#resuming-the-authentication-flow), typically as a result of redirect callback from an [external identity provider][]. If not defined, `onAuthRequired` will be called.

### `OKTA_AUTH`

An Angular InjectionToken added in `okta-angular 5.0` explicitly for [OktaAuth][@okta/okta-auth-js] instance usage.

```typescript
import { Component, Inject, OnInit } from '@angular/core';
import { OKTA_AUTH } from '@okta/okta-angular';
import { OktaAuth } from '@okta/okta-auth-js';

@Component({
  selector: 'app-component',
  imports: [AsyncPipe, JsonPipe],
  template: `
    <pre id="userinfo-container">{{ user | async | json }}</pre>
  `,
})
export class MyProtectedComponent {
  #oktaAuth = inject(OKTA_AUTH);
  user = this.#oktaAuth.getUser();
}
```

### `provideOktaAuth`

The top-level Angular module which provides these components and services:

- [`OktaAuth`][@okta/okta-auth-js] - The passed in [`OktaAuth`][@okta/okta-auth-js] instance with default behavior setup.
- [`OktaAuthGuard`](#oktaauthguard) - A navigation guards implementing [`canActivateFn`](https://angular.dev/guide/routing/route-guards#canactivate) and [`canActivateChildFn`](https://angular.dev/guide/routing/route-guards#canactivatechild) to grant access to a page (and/or its children) only after successful authentication (and only with needed level of end-user assurance if `okta.acrValues` is provided in route data).
- [`OktaCallbackComponent`](#oktacallbackcomponent) - Handles the authentication redirect callback by parsing tokens from the URL and storing them automatically.
- [`OktaAuthStateService`](#oktaauthstateservice) - A data service exposing observable [authState$][AuthState].

### Auth guards

Routes are protected by Okta auth guards, which verifies there is a valid `idToken` stored.  

To verify the level of end-user assurance (see [Step-up authentication](https://developer.okta.com/docs/guides/step-up-authentication/main/)), add `acrValues` to route data in `okta` namespace. Then the auth guards will also verify `acr` claim of `idToken` to match provided `okta.acrValues`. See [list of supported ACR values](https://developer.okta.com/docs/guides/step-up-authentication/main/#predefined-parameter-values). Minimum supported version of `@okta/okta-auth-js` for this feature is `7.1.0`.  

To ensure the user has been authenticated before accessing your route, add the appropriate guard from Okta to one of your routes:

```typescript
// app.routes.ts

import {
  canActivateAuthGuard,
  ...
} from '@okta/okta-angular';

const appRoutes: Routes = [
  {
    path: 'protected',
    component: MyProtectedComponent,
    canActivate: [ canActivateAuthGuard ],
    children: [{
      // children of a protected route are also protected
      path: 'also-protected'
    }]
  },
  ...
]
```

To protect a route with [the assurance level](https://developer.okta.com/docs/guides/step-up-authentication/main/), add [`acrValues`](https://developer.okta.com/docs/guides/step-up-authentication/main/#predefined-parameter-values) to route data in `okta` namespace:

```typescript
// app.routes.ts

import { canActivateAuthGuard } from '@okta/okta-angular';

const appRoutes: Routes = [
  {
    path: 'protected',
    component: MyProtectedComponent,
    canActivate: [ canActivateAuthGuard ],
    data: {
      okta: {
        // requires any 2 factors before accessing the route
        acrValues: 'urn:okta:loa:2fa:any'
      }
    },
  },
  ...
]
```

You can use `canActivateChild` to protect children of an unprotected route:

```typescript
// app.routes.ts

import {
  canActivateChildAuthGuard,
  ...
} from '@okta/okta-angular';

const appRoutes: Routes = [
  {
    path: 'public',
    component: MyPublicComponent,
    canActivateChild: [ canActivateChildAuthGuard ],
    children: [{
      path: 'protected',
      component: MyProtectedComponent
    }]
  },
  ...
]
```

You can use `canMatch` to determine whether a route matches during path matching. It's used for conditional routing with the beneficial side effect of keeping initial bundle size small until navigating to a lazy loaded feature. 

```typescript
// app.routes.ts
import {
  canMatchAuthGuard,
  ...
} from '@okta/okta-angular';
const appRoutes: Routes = [
  {
    path: 'lazy',
    canMatch: [ canMatchAuthGuard ],
    loadChildren: () => import('./lazy-load/lazy-load.routes')
  },
  ...
]
```

If a user does not have a valid session, then a new authorization flow will begin. By default, they will be redirected to the Okta Login Page for authentication. Once authenticated, they will be redirected back to your application's **protected** page. This logic can be customized by setting an `onAuthRequired` function on the config object.

### `OktaCallbackComponent`

Used by the login redirect flow, begun by a call to [signInWithRedirect](https://github.com/okta/okta-auth-js#signinwithredirectoptions). This component handles the callback after the redirect. By default, it parses the tokens from the uri, stores them, then redirects to `/`. If a protected route (using [Okta auth guards](#auth-guards)) caused the redirect, then the callback will redirect back to the protected route. If an error is thrown while processing tokens, the component will display the error and not perform any redirect. This logic can be customized by copying the component to your own source tree and modified as needed. For example, you may want to capture or display errors differently or provide a helpful link for your users in case they encounter an error on the callback route. The most common error is the user does not have permission to access the application. In this case, they may be able to contact an administrator to obtain access.

You should define a route to handle the callback URL (`/login/callback` by default). 

```typescript
// myApp.module.ts
import {
  OktaCallbackComponent,
  ...
} from '@okta/okta-angular';

const appRoutes: Routes = [
  {
    path: 'login/callback',
    component: OktaCallbackComponent
  },
  ...
]
```

### `OktaAuthStateService`

This service exposes an observable (update to date) [authState$][AuthState] to the UI components.

The example below shows connecting two buttons to handle **login** and **logout**:

```typescript
// sample.component.ts

import { Component, inject } from '@angular/core';
import { OktaAuth } from '@okta/okta-auth-js';
import { OktaAuthStateService, OKTA_AUTH } from '@okta/okta-angular';

@Component({
  selector: 'app-component',
  imports: [AsyncPipe, RouterOutlet],
  template: `
    @if(authStateService.authState$ | async)?.isAuthenticated) {
      <button (click)="logout()">Logout</button>
    } @else {
      <button (click)="login()">Login</button>
    }

    <router-outlet></router-outlet>
  `,
})
export class MyComponent {
  #oktaAuth = inject(OKTA_AUTH);
  authStateService = inject(OktaAuthStateService);
  
  async login() {
    await this.#oktaAuth.signInWithRedirect();
  }

  async logout() {
    await this.#oktaAuth.signOut();
  }
}
```

### `OktaHasAnyGroup` directive

This directive implements light role based access control (RBAC) to only render content for authenticated users in group/s. It supports `string`, `array` and `object` input formats.

- `string`: single group name. -- `'admin'`
- `array`: array of group names. -- `['admin', 'it']`
- `object`: key-value pair of group names, this format of input can be used when custom claim is defined. -- `{ 'custom-groups': ['admin', 'it'] }`

Use any format of input when `groups` is available from user claims:

```typescript
@Component({
  imports: [OktaHasAnyGroupDirective], 
  template: `
  <div *oktaHasAnyGroup="['admin']">
    In group
  </div>
  ` 
})
class RBACComponent { }
```

Only use `object` format input when custom claim is defined:

```typescript
@Component({ 
  imports: [OktaHasAnyGroupDirective],
  template: `
  <div *oktaHasAnyGroup="{ 'custom-groups': ['admin', 'it'] }">
    In group
  </div>
  ` 
})
class RBACComponent { }
```

> **Note** - [JWT claim names are case-sensitive](https://www.rfc-editor.org/rfc/rfc7519#section-10.1.1). Ensure the claim name is lowercase for the standard `group` claim or that it matches the casing of your custom group's claim. 

#### Using a custom login-page

Using the [Okta Signin Widget](https://github.com/okta/okta-signin-widget), you can embed the complete authentication flow within your application. This allows users to signin without requiring any redirects. A full working example is available [here](https://github.com/okta/samples-js-angular/tree/master/custom-login)

To implement a custom login page, set an `onAuthRequired` callback on the `OktaConfig` object:

```typescript
// app.config.ts

function onAuthRequired(oktaAuth, injector, options) {
  // `options` object can contain `acrValues` if it was provided in route data

  // Use injector to access any service available within your application
  const router = injector.get(Router);

  // Redirect the user to your custom login page
  router.navigate(['/custom-login']);
}

const oktaAuth = new OktaAuth({ ... });

export const appConfig: ApplicationConfig = {
  providers: [
    ...,
    provideOktaAuth({oktaAuth, onAuthRequired})
  ],
};
```

Alternatively, you can add a `data` attribute directly to a `Route`:

```typescript
// app.routes.ts

const appRoutes: Routes = [
  ...
  {
    path: 'protected',
    component: MyProtectedComponent,
    canActivate: [ canActivateAuthGuard ],
    data: {
      onAuthRequired: onAuthRequired
    }
  }
]
```

##### Resuming the authentication flow

When using a custom login page and an [external identity provider][] your app should be prepared to handle a redirect callback from Okta to resume the authentication flow. The `OktaCallbackComponent` has built-in logic for this scenario.

The `redirectUri` of your application will be requested with a special parameter (`?error=interaction_required`) to indicate that the authentication flow should be resumed by the application. In this case, the `OktaCallbackComponent` will call the `onAuthResume` function (if set on `OktaConfig`). If `onAuthResume` is not defined, then `onAuthRequired` will be called (if defined). If neither method is set in `OktaConfig`, then the `interaction_required` error will be displayed as a string.

If the authentication flow began on the custom login page using the [Okta SignIn Widget][], the transaction will automatically resume when the widget is rendered again on the custom login page.

Note that `onAuthResume` has the same signature as `onAuthRequired`. If you do not need any special logic for resuming an authorization flow, you can define only an `onAuthRequired` method and it will be called both to start or resume an auth flow.

```typescript
// myApp.module.ts

function onAuthResume(oktaAuth, injector) {
  // Use inject function to access providers within an activation context
  const router = inject(Router);

  // Redirect the user to custom login page which renders the Okta SignIn Widget
  router.navigate(['/custom-login']);
}

const oktaConfig = {
  ...
  onAuthResume: onAuthResume
};
```

## Using @okta/okta-angular/client-js (opt-in, beta)

> :warning: This subpath is **beta** and **opt-in**. It has no effect on the default `@okta/okta-angular` entry point described above, and its API may change in a future minor release. `okta-auth-js`-based consumers can ignore this section entirely — nothing here is installed or evaluated unless you import from `@okta/okta-angular/client-js` yourself.

`@okta/okta-angular/client-js` is a small set of Angular router adapters for [`@okta/okta-client-javascript`](https://github.com/okta/okta-client-javascript) (published as the `@okta/auth-foundation`, `@okta/oauth2-flows`, and `@okta/spa-platform` packages), offered as an alternative to the `@okta/okta-auth-js`-based API this library has always shipped.

The two SDKs model authentication differently. `@okta/okta-auth-js` keeps a persistent `AuthState` that you subscribe to via `OktaAuthStateService`, and `OktaCallbackComponent`/the `okta.guard.ts` guards read from that state. `@okta/okta-client-javascript` has no such object: `AuthorizationCodeFlowOrchestrator.getToken()` and `FetchClient.fetch()` each resolve, refresh, or redirect on demand at the moment a token is actually needed, and there's nothing to subscribe to. The adapters below wrap that request-time model in Angular's native functional router primitives (`CanActivateFn` and a plain `fetch` helper), wired into Angular's dependency injector the same way `provideOktaAuth`/`OKTA_AUTH` wire up the `okta-auth-js` path above — you register your already-constructed `orchestrator` once via `provideClientJsAuth`, and the exported helpers `inject()` it, rather than being built by factory functions you have to thread instances through yourself.

### Installation

```
npm install @okta/auth-foundation @okta/oauth2-flows @okta/spa-platform
```

These three packages are optional peer dependencies of `@okta/okta-angular` — installing `@okta/okta-angular` alone does not pull them in.

### Example

Construct your flow and orchestrator once, and register them with `provideClientJsAuth`:

```typescript
// app.config.ts
import { ApplicationConfig } from '@angular/core';
import { AuthorizationCodeFlow, AuthorizationCodeFlowOrchestrator } from '@okta/spa-platform';
import { provideClientJsAuth } from '@okta/okta-angular/client-js';

const flow = new AuthorizationCodeFlow({
  issuer: 'https://{yourOktaDomain}/oauth2/default',
  clientId: '{clientId}',
  redirectUri: window.location.origin + '/login/callback',
  scopes: ['openid', 'profile', 'email'],
});

const orchestrator = new AuthorizationCodeFlowOrchestrator(flow);

export const appConfig: ApplicationConfig = {
  providers: [
    // ...your other providers
    provideClientJsAuth({ orchestrator }),
  ],
};
```

`fetchClient` is optional: when you leave it out, `provideClientJsAuth` builds `new FetchClient(orchestrator)` for you. Pass your own only if you need to configure it — e.g. `provideClientJsAuth({ orchestrator, fetchClient: new FetchClient(orchestrator) })`.

Then use the exported `tokenGuard`, `loginCallbackGuard`, and `oktaFetch` directly in your route config — no factories, no manual wiring of instances:

```typescript
// app.routes.ts
import { Routes } from '@angular/router';
import { tokenGuard, loginCallbackGuard, oktaFetch } from '@okta/okta-angular/client-js';

export const routes: Routes = [
  { path: 'login/callback', canActivate: [loginCallbackGuard], children: [] },
  {
    path: 'protected',
    canActivate: [tokenGuard],
    resolve: { messages: () => oktaFetch('/api/messages').then((res) => res.json()) },
    component: ProtectedComponent,
  },
];
```

The callback route needs no component of its own — `loginCallbackGuard` redirects before anything renders. Give it an empty `children: []` (or any placeholder component you like) to satisfy the router's requirement that a route do *something*.

#### `tokenGuard`

`tokenGuard` is a `CanActivateFn`. Because its body only reads `route.data` and calls `orchestrator.getToken()`, it also works unchanged as a `canActivateChild` or `canMatch` guard. Note that `canMatch` is not a drop-in swap for `canActivate` in behaviour: a rejected `canMatch` makes the router skip the route and keep matching (falling through to a later route or a wildcard), whereas a rejected `canActivate` aborts the navigation. Since `getToken()` redirects to sign-in rather than resolving falsy in the common case, the difference rarely shows up — but pick the hook for the routing semantics you want, not because the two are interchangeable.

To pass per-route [`TokenOrchestrator.AuthorizeParams`](https://github.com/okta/okta-client-javascript) (e.g. extra scopes), set them on the route's `data`, the same way the existing `okta-auth-js` guards read `route.data['okta']['acrValues']`:

```typescript
{ path: 'admin', canActivate: [tokenGuard], data: { clientJs: { params: { scopes: ['openid', 'admin'] } } } }
```

The `data` shape is exported as `ClientJsRouteData` if you want to type your route definitions against it.

#### `loginCallbackGuard`

`loginCallbackGuard` replaces `OktaCallbackComponent` for this SDK: it resumes the flow from the current URL and returns a [`RedirectCommand`](https://angular.dev/api/router/RedirectCommand) pointing at the original pre-login URL. The `originalUri` recorded when the flow started is treated as untrusted input — anything that isn't a same-origin URL collapses to `/` rather than being followed.

`orchestrator.resumeFlow()` **throws** when the authorization server returns an error (`access_denied`, an expired or replayed `state`, a user closing the Okta-hosted form, etc.). By default the guard lets that rejection propagate, which surfaces as a failed navigation — the browser stays on the callback URL and your `ErrorHandler` sees the error. To handle it in-app, pass `onLoginCallbackError`; whatever it returns becomes the guard's result:

```typescript
provideClientJsAuth({
  orchestrator,
  onLoginCallbackError: (error) => {
    console.error(error);
    return new RedirectCommand(inject(Router).parseUrl('/login/error'));
  },
});
```

`onLoginCallbackError` runs inside the guard's injection context, so `inject()` works in its body. It may return anything a `CanActivateFn` may return (`boolean`, `UrlTree`, `RedirectCommand`), synchronously or as a promise.

#### `signOut`

`signOut()` clears the stored credential and performs RP-initiated logout at Okta. It needs a `SessionLogoutFlow`, which you pass as `signOutFlow`:

```typescript
import { SessionLogoutFlow } from '@okta/spa-platform';

provideClientJsAuth({
  orchestrator,
  signOutFlow: new SessionLogoutFlow({
    issuer: 'https://{yourOktaDomain}/oauth2/default',
    clientId: '{clientId}',
    scopes: ['openid', 'profile', 'email'],
    logoutRedirectUri: window.location.origin,
  }),
});
```

Call it from an injection context; pass `{ revokeTokens: false }` to drop the local credential without revoking at the authorization server:

```typescript
export class HeaderComponent {
  readonly #injector = inject(Injector);

  logout() {
    runInInjectionContext(this.#injector, () => signOut());
  }
}
```

#### Making authenticated requests: `oktaFetch`, not an `HttpInterceptorFn`

`oktaFetch` is a thin wrapper over the registered `FetchClient.fetch()` with the same signature as the global `fetch`. Use it anywhere in an injection context:

```typescript
const res = await oktaFetch('/api/messages');
```

This subpath deliberately does **not** ship an `HttpInterceptorFn` for Angular's `HttpClient`. `FetchClient` does considerably more than attach an `Authorization` header: it retries on a DPoP nonce challenge, retries once on a 401, handles ACR step-up challenges, and backs off on a 429. A header-only interceptor would look equivalent and silently drop all of that — most visibly DPoP, where the first request of a session is *expected* to fail with a nonce challenge that must be replayed. If you need `HttpClient` (for its interceptor chain, `HttpContext`, or testing utilities), write the interceptor in your app so the omission is a decision you made rather than one the library made for you, and be aware that DPoP-bound tokens will not work through it.

## Testing

To run Jest tests for your app using `@okta/okta-angular` please add `@okta/okta-angular` (and some of its dependencies listed below) to `transformIgnorePatterns` in `jest.config.js`:
```js
export default {
  preset: 'jest-preset-angular',
  transformIgnorePatterns: [
    'node_modules/(?!.*\\.mjs$|rxjs|@okta/okta-auth-js|jsonpath-plus|@okta/okta-angular)'
  ],
  ...
}
```
Jest should transform listed dependencies, because `@okta/okta-angular` version 6 uses `.js` extension for exporting files from the package.

## Contributing

We welcome contributions to all of our open-source packages. Please see the [contribution guide](https://github.com/okta/okta-oidc-js/blob/master/CONTRIBUTING.md) to understand how to structure a contribution.

### Installing dependencies for contributions

We use [yarn](https://yarnpkg.com) for dependency management when developing this package:

```bash
yarn install
```

### Commands

| Command      | Description                        |
|--------------|------------------------------------|
| `yarn start` | Start the sample app using the SDK |
| `yarn test`  | Run unit and integration tests     |
| `yarn lint`  | Run eslint linting tests           |

[ID Token Claims]: https://developer.okta.com/docs/api/resources/oidc#id-token-claims
[UserInfo endpoint]: https://developer.okta.com/docs/api/resources/oidc#userinfo
[Customizing Your Authorization Server]: https://developer.okta.com/authentication-guide/implementing-authentication/set-up-authz-server
