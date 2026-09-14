/*
 * Copyright (c) 2017-Present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

import { InjectionToken } from '@angular/core';
import type { GuardResult } from '@angular/router';
import type { AuthorizationCodeFlowOrchestrator, SessionLogoutFlow } from '@okta/spa-platform';
// Typed against the `@okta/auth-foundation` base class rather than `@okta/spa-platform`'s subclass:
// the subclass declares a `protected` member, which makes it nominally distinct, so a plain
// `FetchClient` built straight from `@okta/auth-foundation` would not be assignable to it. The base
// type accepts both, and `fetch()` is declared on it.
import type { FetchClient, TokenOrchestrator } from '@okta/auth-foundation';

export interface ClientJsAuthConfig {
  /**
   * The orchestrator every other piece of this entry point derives from. It resolves a stored
   * credential, refreshes it when needed, or triggers a full redirect to Okta when it can't.
   */
  orchestrator: AuthorizationCodeFlowOrchestrator;

  /**
   * Client used by `oktaFetch`. Defaults to `new FetchClient(orchestrator)`.
   *
   * Pass your own only when you need non-default `APIClient` configuration (`dpop`, `fetchImpl`) -
   * and construct it from the *same* `orchestrator` you pass above, or the credential written by
   * `loginCallbackGuard` won't be the one your requests read back.
   */
  fetchClient?: FetchClient;

  /**
   * Required by `signOut()`. Without it, `signOut()` throws.
   */
  signOutFlow?: SessionLogoutFlow;

  /**
   * Called by `loginCallbackGuard` when `orchestrator.resumeFlow()` throws - an OAuth error
   * response from the authorization server, or a `state` mismatch. Runs in the guard's injection
   * context, so `inject(Router)` and friends work inside it.
   *
   * Return whatever the guard should return: a `UrlTree`/`RedirectCommand` to send the user to an
   * error route, or `false` to abort the navigation. When this is not provided the error is
   * rethrown, which surfaces as a router `NavigationError` - handle it with `Router.events`,
   * `withNavigationErrorHandler()`, or a global `ErrorHandler`, or the user is left on the
   * callback route with nothing rendered.
   */
  onLoginCallbackError?: (error: unknown) => GuardResult | Promise<GuardResult>;
}

/**
 * The shape `tokenGuard` reads out of a route's `data`. Spread it into `data` to get the key
 * checked rather than relying on the string literal:
 *
 * @example
 * const routeData: ClientJsRouteData = { clientJs: { params: { scopes: ['openid', 'admin'] } } };
 */
export interface ClientJsRouteData {
  clientJs?: {
    params?: TokenOrchestrator.AuthorizeParams;
  };
}

export const CLIENT_JS_ORCHESTRATOR = new InjectionToken<AuthorizationCodeFlowOrchestrator>('okta.client-js.orchestrator');
export const CLIENT_JS_FETCH_CLIENT = new InjectionToken<FetchClient>('okta.client-js.fetch-client');
export const CLIENT_JS_SIGN_OUT_FLOW = new InjectionToken<SessionLogoutFlow | undefined>('okta.client-js.sign-out-flow');
export const CLIENT_JS_CONFIG = new InjectionToken<ClientJsAuthConfig>('okta.client-js.config');
