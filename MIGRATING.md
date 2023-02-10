[AuthState]: https://github.com/okta/okta-auth-js#authstatemanager
[transformAuthState]: https://github.com/okta/okta-auth-js/blob/master/README.md#transformauthstate
[OktaAuth]: https://github.com/okta/okta-auth-js

# Migrating

## To version 6.1.0

Starting with `@okta/okta-angular 6.1.0`, the preferred way to import `OktaAuthModule` is by using `forRoot()` static method to create a singleton service. 

Before:
```typescript
import { OktaAuthModule, OKTA_CONFIG } from '@okta/okta-angular';

@NgModule({
  imports: [
    ...
    OktaAuthModule
  ],
  providers: [
    { 
      provide: OKTA_CONFIG, 
      useValue: { oktaAuth } 
    }
  ],
})
export class MyAppModule { }
```

After:
```typescript
import { OktaAuthModule } from '@okta/okta-angular';

@NgModule({
  imports: [
    ...
    OktaAuthModule.forRoot({ oktaAuth })
  ]
})
export class MyAppModule { }
```

## From version 5.x to 6.x

`@okta/okta-angular` 6.0 uses [Ivy engine](https://docs.angular.lat/guide/ivy) and drops support of Angular versions prior to 12.  
Please upgrade your Angular project to Angular 12+ (having enabled Ivy by default and no support for View Engine compiler) in order to use newer version of `@okta/okta-angular`.  
No specific code changes are required to upgrade to `@okta/okta-angular` 6.0.  
If you project can't be upgraded to Angular 12+, please use `@okta/okta-angular` 5.x

## From version 4.x to 5.x

### Adding `OKTA_AUTH` injection token explicitly for `oktaAuth` usage

To fix Angular 7 & 8 production build [issue](https://github.com/okta/okta-angular/issues/72), `oktaAuth` instance is now injected by [injection token](https://angular.io/api/core/InjectionToken) instead of implicit referring by types.

```typescript
import { Component } from '@angular/core';
import { OKTA_AUTH } from '@okta/okta-angular';

@Component({
  selector: 'app-component',
  template: `
    <div>page content</div>
  `,
})
export class MyComponent {
  constructor(@Inject(OKTA_AUTH) private oktaAuth: OktaAuth) {}
}
```

## From version 3.x to 4.x

### Updating `OktaConfig`

From version 4.0, an `OktaConfig` starts to explicitly accept [OktaAuth][] instance to replace the internal `OktaAuthService`. You will need to replace the [OktaAuth related configurations](https://github.com/okta/okta-auth-js#configuration-reference) with a pre-initialized [OktaAuth][] instance.

**Note**

- `@okta/okta-auth-js` is now a peer dependency for this SDK. You must add `@okta/okta-auth-js` as a dependency to your project and install it separately from `@okta/okta-angular`.

```typescript
import {
  OKTA_CONFIG,
  OktaAuthModule
} from '@okta/okta-angular';
import { OktaAuth } from '@okta/okta-auth-js';

const config = {
  issuer: 'https://{yourOktaDomain}/oauth2/default',
  clientId: '{clientId}',
  redirectUri: window.location.origin + '/login/callback'
}
const oktaAuth = new OktaAuth(config);

@NgModule({
  imports: [
    ...
    OktaAuthModule
  ],
  providers: [
    { 
      provide: OKTA_CONFIG, 
      useValue: { oktaAuth } 
    }
  ],
})
export class MyAppModule {}
```

### Replacing `OktaAuthService` with `OktaAuth`

Previously, the SDK module injects `OktaAuthService` to the application, now it's replaced with `OktaAuth`. Almost all the public APIs are still the same except:

#### Getting `OktaConfig` from dependency injection

[OktaAuth][] instance does not have the `getOktaConfig` method, but it's still provided by OktaAuthModule via Angular dependency injection system.

#### Using Observable [AuthState][] from a seperate data service

[OktaAuth][] instance does not have an observable auth state, `OktaAuthStateService` has been added to serve this purpose. The UI component can track the up to date auth state with code like:

```typescript
import { Component } from '@angular/core';
import { OktaAuthStateService } from '@okta/okta-angular';

@Component({
  selector: 'app-component',
  template: `
    <button *ngIf="!(authStateService.authState$ | async).isAuthenticated">Login</button>
    <button *ngIf="(authStateService.authState$ | async).isAuthenticated">Logout</button>
    <router-outlet></router-outlet>
  `,
})
export class MyComponent {
  constructor(private authStateService: OktaAuthStateService) {}
}
```

### Replacing `OktaLoginRedirectComponent` with `oktaAuth.signInWithRedirect`

`OktaLoginRedirectComponent` is removed from version 4.0. You can call `oktaAuth.signInWithRedirect` to achieve the same effect.

### Replacing `isAuthenticated` callback option with [transformAuthState](https://github.com/okta/okta-auth-js#transformauthstate) from [OktaAuth][] configuration.

`isAuthenticated` callback option is removed from version 4.0. You can use the [transformAuthState](https://github.com/okta/okta-auth-js#transformauthstate) callback option from [OktaAuth][] to customize the AuthState.

## From version 2.x to 3.x

### Full `@okta/okta-auth-js` API is available

`@okta/okta-angular` version 2.x and earlier provided a wrapper around [@okta/okta-auth-js](https://github.com/okta/okta-auth-js) but many methods were hidden. Version 3.x extends `okta-auth-js` so the full [api](https://github.com/okta/okta-auth-js/blob/master/README.md#api-reference) and all [options](https://github.com/okta/okta-auth-js/blob/master/README.md#configuration-options) are now supported by this SDK. To provide a better experience, several methods which existed on the wrapper have been removed or replaced.

### "Active" token renew

Previously, tokens would only be renewed when they were read from storge. This typically occurred when a user was navigating to a protected route. Now, tokens will be renewed in the background before they expire. If token renew fails, the [AuthState][] will be updated and `isAuthenticated` will be recalculated. If the user is currently on a protected route, they will need to re-authenticate. Set the `onAuthRequired` option to customize behavior when authentication is required. You can set [tokenManager.autoRenew](https://github.com/okta/okta-auth-js/blob/master/README.md#autorenew) to `false` to disable active token renew logic.

### `login` is removed

This method called `onAuthRequired`, if it was set in the config options, or `loginRedirect` if no `onAuthRequired` option was set. If you had code that was calling this method, you may either call your `onAuthRequired` function directly or `signInWithRedirect`.

### `loginRedirect` is replaced by `signInWithRedirect`

`loginRedirect` took 2 parameters: a `fromUri` and `additionalParams`. The replacement method, [signInWithRedirect](https://github.com/okta/okta-auth-js/blob/master/README.md#signinwithredirectoptions) takes only one argument, called `options` which can include a value for `originalUri` which is equivalent to `fromUri`. It is the URL which will be set after the login flow is complete. Other options which were previously set on `additionalParams` can also be set on `options`.

If you had code like this:

```javascript
okta.loginRedirect('/profile', { scopes: ['openid', 'profile'] });
```

it can be rewritten as:

```javascript
okta.signInWithRedirect({ originalUri: '/profile', scopes: ['openid', 'profile'] });
```

### `logout` is replaced by `signOut`

`logout` accepted either a string or an object as options. [signOut](https://github.com/okta/okta-auth-js/blob/master/README.md#signout) accepts only an options object.

If you had code like this:

```javascript
okta.logout('/goodbye');
```

it can be rewritten as:

```javascript
okta.signOut({ postLogoutRedirectUri: window.location.orign + '/goodbye' });
```

Note that the value for `postLogoutRedirectUri` must be an absolute URL. This URL must also be on the "allowed list" in your Okta app's configuration. If no options are passed or no `postLogoutRedirectUri` is set on the options object, it will redirect to `window.location.origin` after sign out is complete.

### `handleAuthentication` is replaced by `handleLoginRedirect`

`handleLoginRedirect` is called by the `OktaLoginCallback` component as the last step of the login redirect authorization flow. It will obtain and store tokens and then call `restoreOriginalUri` which will return the browser to the `originalUri` which was set before the login redirect flow began.

### `setFromUri` and `getFromUri` have been replaced with `setOriginalUri` and `getOriginalUri`

[setOriginalUri](https://github.com/okta/okta-auth-js#setoriginaluriuri) is used to save the current/pending URL before beginning a redirect flow. There is a new option, [restoreOriginalUri](https://github.com/okta/okta-auth-js#restoreoriginaluri), which can be used to customize the last step of the login redirect flow.

### "openid" is not automatically added to scopes

If you are passing a custom array of scopes, you should add "openid" to the array

### `isAuthenticated` will be true if **both** accessToken **and** idToken are valid

If you have a custom `isAuthenticated` function which implements the default logic, you may remove it.

### `isAuthenticated` is called by `transformAuthState`

After the [AuthState][] is updated, but before it is emitted, [transformAuthState][] will be called. During this call, the `isAuthenticated` option, if set on the config object, will be called to set the value of `authState.isAuthenticated`. By default, `authState.isAuthenticated` will be true if **both** the access token and ID token are valid. This logic can be customized by providing a custom `isAuthenticated` function on the config object. You may also provide your own [transformAuthState][] function to customize the [AuthState][] object before it is emitted.

### `getTokenManager` has been removed

You may access the `TokenManager` with the `tokenManager` property:

```javascript
const tokens = oktaAuth.tokenManager.getTokens();
```
