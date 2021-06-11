[@okta/okta-auth-js]: https://github.com/okta/okta-auth-js
[@angular/router]: https://angular.io/guide/router
[Observable]: https://angular.io/guide/observables
[Dependency Injection]: https://angular.io/guide/dependency-injection
[OktaAuthService]: #oktaauthservice
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

> This library has been tested for compatibility with the following Angular versions: 7, 8, 9, 10, 11, 12
> :warning: Angular versions older than 7 may not be fully compatible with all dependencies of this library, due to an older Typescript version which does not contain a definition for the `unknown` type. You may be able to workaround this issue by setting `skipLibChecks: true` in your `tsconfig.json` file.

## Getting Started

- If you do not already have a **Developer Edition Account**, you can create one at [https://developer.okta.com/signup/](https://developer.okta.com/signup/).
- An Okta Application, configured for Single-Page App (SPA) mode. This is done from the Okta Developer Console and you can find instructions [here](https://developer.okta.com/authentication-guide/implementing-authentication/implicit#1-setting-up-your-application). When following the wizard, use the default properties. They are are designed to work with our sample applications.

### Helpful Links

- [Angular Quickstart](https://angular.io/guide/quickstart)
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
npm install --save @okta/okta-angular
```

## Usage

Add [`OktaAuthModule`](#oktaauthmodule) to your module's imports.
Create a configuration object and provide this as [`OKTA_CONFIG`](#okta_config).

```typescript
// myApp.module.ts

import {
  OKTA_CONFIG,
  OktaAuthModule
} from '@okta/okta-angular';

const oktaConfig = {
  issuer: 'https://{yourOktaDomain}/oauth2/default',
  clientId: '{clientId}',
  redirectUri: window.location.origin + '/login/callback'
}

@NgModule({
  imports: [
    ...
    OktaAuthModule
  ],
  providers: [
    { provide: OKTA_CONFIG, useValue: oktaConfig }
  ],
})
export class MyAppModule { }
```

### `OKTA_CONFIG`

An Angular InjectionToken used to configure the OktaAuthService. This value must be provided by your own application. The base set of configuration options are defined by [@okta/okta-auth-js][]. The following properties are **required**:

- `issuer` **(required)**: The OpenID Connect `issuer`
- `clientId` **(required)**: The OpenID Connect `client_id`
- `redirectUri` **(required)**: Where the callback is hosted

This SDK accepts all configuration options defined by [@okta/okta-auth-js][] and adds some additional options:

- `onAuthRequired` *(optional)*: - callback function. Triggered when a route protected by `OktaAuthGuard` is accessed without authentication. Use this to present a [custom login page](#using-a-custom-login-page). If no `onAuthRequired` callback is defined, `okta-angular` will redirect directly to Okta for authentication.
- `onAuthResume` *(optional)*: - callback function. Only relevant if using a [custom login page](#using-a-custom-login-page). Called when the [authentication flow should be resumed by the application](#resuming-the-authentication-flow), typically as a result of redirect callback from an [external identity provider][]. If not defined, `onAuthRequired` will be called.
- `isAuthenticated` *(optional)* - callback function. By default, [OktaAuthService.isAuthenticated()](https://github.com/okta/okta-auth-js#isauthenticatedtimeout) will return true if **both** [getIdToken()](https://github.com/okta/okta-auth-js#getidtoken) **and** [getAccessToken()](https://github.com/okta/okta-auth-js#getaccesstoken) return a value. Setting an `isAuthenticated` function on the config allows you to customize this logic. The function receives an instance of `OktaAuthService` as a parameter and should return a Promise which resolves to either true or false.

### `OktaAuthModule`

The top-level Angular module which provides these components and services:

- [`OktaAuthGuard`](#oktaauthguard) - A navigation guard implementing [CanActivate](https://angular.io/api/router/CanActivate) and [CanActivateChild](https://angular.io/api/router/CanActivateChild) to grant access to a page (and/or its children) only after successful authentication.
- [`OktaCallbackComponent`](#oktacallbackcomponent) - Handles the implicit flow callback by parsing tokens from the URL and storing them automatically.
- [`OktaLoginRedirectComponent`](#oktaloginredirectcomponent) - Redirects users to the Okta Hosted Login Page for authentication.
- [`OktaAuthService`](#oktaauthservice) - Highest-level service containing the `okta-angular` public methods.

### `OktaAuthGuard`

Routes are protected by the `OktaAuthGuard`, which verifies there is a valid `accessToken` stored. To ensure the user has been authenticated before accessing your route, add the `canActivate` guard to one of your routes:

```typescript
// myApp.module.ts

import {
  OktaAuthGuard,
  ...
} from '@okta/okta-angular';

const appRoutes: Routes = [
  {
    path: 'protected',
    component: MyProtectedComponent,
    canActivate: [ OktaAuthGuard ],
    children: [{
      // children of a protected route are also protected
      path: 'also-protected'
    }]
  },
  ...
]
```

You can use `canActivateChild` to protect children of an unprotected route:

```typescript
// myApp.module.ts

import {
  OktaAuthGuard,
  ...
} from '@okta/okta-angular';

const appRoutes: Routes = [
  {
    path: 'public',
    component: MyPublicComponent,
    canActivateChild: [ OktaAuthGuard ],
    children: [{
      path: 'protected',
      component: MyProtectedComponent
    }]
  },
  ...
]
```

If a user does not have a valid session, then a new authorization flow will begin. By default, they will be redirected to the Okta Login Page for authentication. Once authenticated, they will be redirected back to your application's **protected** page. This logic can be customized by setting an `onAuthRequired` function on the config object.

### `OktaCallbackComponent`

Used by the login redirect flow, begun by a call to [signInWithRedirect](https://github.com/okta/okta-auth-js#signinwithredirectoptions). This component handles the callback after the redirect. By default, it parses the tokens from the uri, stores them, then redirects to `/`. If a protected route (using [`OktaAuthGuard`](#oktaauthguard)) caused the redirect, then the callback will redirect back to the protected route. If an error is thrown while processing tokens, the component will display the error and not perform any redirect. This logic can be customized by copying the component to your own source tree and modified as needed. For example, you may want to capture or display errors differently or provide a helpful link for your users in case they encounter an error on the callback route. The most common error is the user does not have permission to access the application. In this case, they may be able to contact an administrator to obtain access.

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

### `OktaLoginRedirectComponent`

The `OktaLoginRedirect` component redirects the user's browser to the Okta-hosted login page for your organization. For more advanced cases, this component can be copied to your own source tree and modified as needed.

```typescript
// myApp.module.ts
import {
  OktaLoginRedirectComponent,
  ...
} from '@okta/okta-angular';

const appRoutes: Routes = [
  {
    path: 'login',
    component: OktaLoginRedirectComponent
  },
  ...
]
```

#### Using a custom login-page

Using the [Okta Signin Widget](https://github.com/okta/okta-signin-widget), you can embed the complete authentication flow within your application. This allows users to signin without requiring any redirects. A full working example is available [here](https://github.com/okta/samples-js-angular/tree/master/custom-login)

To implement a custom login page, set an `onAuthRequired` callback on the `OktaConfig` object:

```typescript
// myApp.module.ts

function onAuthRequired(oktaAuth, injector) {
  // Use injector to access any service available within your application
  const router = injector.get(Router);

  // Redirect the user to your custom login page
  router.navigate(['/custom-login']);
}

const oktaConfig = {
  issuer: environment.ISSUER,
  ...
  onAuthRequired: onAuthRequired
};
```

Alternatively, you can add a `data` attribute directly to a `Route`:

```typescript
// myApp.module.ts

const appRoutes: Routes = [
  ...
  {
    path: 'protected',
    component: MyProtectedComponent,
    canActivate: [ OktaAuthGuard ],
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
  // Use injector to access any service available within your application
  const router = injector.get(Router);

  // Redirect the user to custom login page which renders the Okta SignIn Widget
  router.navigate(['/custom-login']);
}

const oktaConfig = {
  issuer: environment.ISSUER,
  ...
  onAuthResume: onAuthResume
};
```

### `OktaAuthService`

In your components, your can take advantage of all of `okta-angular`'s features by importing the `OktaAuthService`. The `OktaAuthService` inherits from the `OktaAuth` service exported by [@okta/okta-auth-jks][] making the full [configuration](https://github.com/okta/okta-auth-js#configuration-reference) and [api](https://github.com/okta/okta-auth-js#api-reference) available on `OktaAuthService`.

The example below shows connecting two buttons to handle **login** and **logout**:

```typescript
// sample.component.ts

import { Component, OnInit } from '@angular/core';
import { OktaAuthService } from '@okta/okta-angular';

@Component({
  selector: 'app-component',
  template: `
    <button *ngIf="!isAuthenticated" (click)="login()">Login</button>
    <button *ngIf="isAuthenticated" (click)="logout()">Logout</button>

    <router-outlet></router-outlet>
  `,
})
export class MyComponent {
  isAuthenticated: boolean;
  constructor(public oktaAuth: OktaAuthService) {
    // subscribe to authentication state changes
    this.oktaAuth.$authenticationState.subscribe(
      (isAuthenticated: boolean)  => this.isAuthenticated = isAuthenticated
    );
  }
  async ngOnInit() {
    // get authentication state for immediate use
    this.isAuthenticated = await this.oktaAuth.isAuthenticated();
  }
  async login() {
    await this.oktaAuth.signInWithRedirect({
      originalUri: '/profile'
    });
  }
  async logout() {
    await this.oktaAuth.signOut();
  }
}
```

#### `oktaAuth.$authenticationState`

An observable that returns true/false when the [AuthState][] changes.

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
